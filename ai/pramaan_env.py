# -----------------------------------------------------------------------------
# Pramaan RL Environment
#
# This script defines the custom Gymnasium environment for our AI detective.
# It handles loading the dataset, presenting evidence (states), and providing
# rewards for correct classifications.
# -----------------------------------------------------------------------------

import gymnasium as gym
from gymnasium import spaces
import numpy as np
import os
import cv2
from PIL import Image
import piexif
from sklearn.preprocessing import StandardScaler

# --- IMPORTANT: Feature Extraction Logic ---
# This section MUST be an exact copy of the feature extraction from your
# most up-to-date training script to ensure consistency.
# ---
DATASET_PATH = 'dataset'
REAL_PATH = os.path.join(DATASET_PATH, 'real')
FAKE_PATH = os.path.join(DATASET_PATH, 'fake')

def get_ela_metrics(filepath: str) -> dict:
    TEMP_ELA_FILE = filepath + '.ela.tmp.jpg'
    try:
        original = Image.open(filepath)
        if original.mode != 'RGB': original = original.convert('RGB')
        original.save(TEMP_ELA_FILE, 'JPEG', quality=95)
        original_cv, resaved_cv = cv2.imread(filepath), cv2.imread(TEMP_ELA_FILE)
        diff = cv2.absdiff(original_cv, resaved_cv)
        return { 'ela_mean': float(diff.mean()), 'ela_std': float(diff.std()), 'ela_max': float(diff.max()), 'ela_contrast': float(diff.max()) - float(diff.min()) }
    except Exception:
        return {'ela_mean': 0.0, 'ela_std': 0.0, 'ela_max': 0.0, 'ela_contrast': 0.0}
    finally:
        if os.path.exists(TEMP_ELA_FILE): os.remove(TEMP_ELA_FILE)

def analyze_exif(filepath: str) -> dict:
    try:
        exif_dict = piexif.load(filepath)
        software_tag_present = 1 if piexif.ImageIFD.Software in exif_dict['0th'] else 0
        has_date_info = 1 if piexif.ImageIFD.DateTime in exif_dict['0th'] else 0
        return {'software_tag': float(software_tag_present), 'has_date_info': float(has_date_info)}
    except Exception:
        return {'software_tag': 1.0, 'has_date_info': 0.0}

def analyze_forensic_metrics(image: np.ndarray) -> dict:
    b, g, r = cv2.split(image)
    std_dev_r, std_dev_g, std_dev_b = float(np.std(r)), float(np.std(g)), float(np.std(b))
    corr_gb = np.corrcoef(g.flatten(), b.flatten())[0, 1]
    corr_gr = np.corrcoef(g.flatten(), r.flatten())[0, 1]
    corr_br = np.corrcoef(b.flatten(), r.flatten())[0, 1]
    avg_corr = (corr_gb + corr_gr + corr_br) / 3.0
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    noise_variance = np.var(gray - cv2.GaussianBlur(gray, (5, 5), 0))
    laplacian_variance = np.var(cv2.Laplacian(gray, cv2.CV_64F))
    return {'laplacian_variance': float(laplacian_variance), 'noise_variance': float(noise_variance), 'cross_channel_correlation': float(avg_corr) if not np.isnan(avg_corr) else 0.0, 'std_dev_r': std_dev_r, 'std_dev_g': std_dev_g, 'std_dev_b': std_dev_b }

def extract_features(filepath: str):
    try:
        ela_metrics = get_ela_metrics(filepath)
        exif_metrics = analyze_exif(filepath)
        image = cv2.imread(filepath)
        if image is None: return None
        other_metrics = analyze_forensic_metrics(image)
        return [ ela_metrics['ela_mean'], ela_metrics['ela_std'], ela_metrics['ela_max'], ela_metrics['ela_contrast'], other_metrics['laplacian_variance'], other_metrics['noise_variance'], other_metrics['cross_channel_correlation'], other_metrics['std_dev_r'], other_metrics['std_dev_g'], other_metrics['std_dev_b'], exif_metrics['software_tag'], exif_metrics['has_date_info'] ]
    except Exception:
        return None
# --- End of copied feature extraction ---

class PramaanEnv(gym.Env):
    """A custom Gym environment for the Pramaan Tampering Detector."""
    
    def __init__(self):
        super(PramaanEnv, self).__init__()
        
        # Define the action space: 0 for 'real', 1 for 'fake'
        self.action_space = spaces.Discrete(2)
        
        # Define the observation space (our 13 forensic features)
        # We set low and high bounds for the feature values
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(12,), dtype=np.float64)
        
        # Load and process the dataset
        self._load_dataset()
        self.current_case_index = 0
        
    def _load_dataset(self):
        """Loads all features and labels from the dataset folder."""
        print("Loading dataset for RL environment...")
        features, labels = [], []
        
        real_files = [os.path.join(REAL_PATH, f) for f in os.listdir(REAL_PATH)]
        fake_files = [os.path.join(FAKE_PATH, f) for f in os.listdir(FAKE_PATH)]
        
        for filepath in real_files:
            vec = extract_features(filepath)
            if vec: features.append(vec); labels.append(0)
        for filepath in fake_files:
            vec = extract_features(filepath)
            if vec: features.append(vec); labels.append(1)
            
        if not features:
            raise ValueError("No features could be extracted. Is the dataset empty?")
            
        # Scale features for better performance
        self.scaler = StandardScaler().fit(features)
        self.X = self.scaler.transform(features)
        self.y = np.array(labels)
        print("Dataset loaded and scaled.")

    def reset(self, seed=None):
        """Resets the environment to a new random case."""
        super().reset(seed=seed)
        self.current_case_index = np.random.randint(len(self.X))
        observation = self.X[self.current_case_index]
        info = {} # You can add extra info here if needed
        return observation, info

    def step(self, action):
        """Execute one time step within the environment."""
        true_label = self.y[self.current_case_index]
        
        # --- The Reward System ---
        if action == true_label:
            reward = 10  # Correct classification
        elif action == 1 and true_label == 0: # False Positive
            reward = -50 # Heavily penalize flagging a real doc as fake
        else: # False Negative
            reward = -20 # Penalize letting a fake doc pass
            
        # An episode is done after one classification
        terminated = True 
        truncated = False # Not used in our case
        info = {'true_label': true_label, 'predicted_label': action}
        
        # Get the next case for the subsequent reset()
        self.current_case_index = (self.current_case_index + 1) % len(self.X)
        observation = self.X[self.current_case_index]
        
        return observation, reward, terminated, truncated, info
