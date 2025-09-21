# -----------------------------------------------------------------------------
# Pramaan Forensic Model - Trainer (Definitive Edition with PDF Support)
#
# This version is "PDF-aware." It automatically converts PDFs in the dataset
# during training, teaching the model to correctly differentiate between a
# converted-but-legit PDF and a truly tampered image.
# -----------------------------------------------------------------------------

import cv2
import numpy as np
import os
from PIL import Image
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import piexif
from pdf2image import convert_from_path

# --- Configuration ---
DATASET_PATH = 'dataset'
REAL_PATH = os.path.join(DATASET_PATH, 'real')
FAKE_PATH = os.path.join(DATASET_PATH, 'fake')
MODEL_SAVE_PATH = 'pramaan_model.pkl'
# On Windows, you may need to provide the poppler path here for the trainer
poppler_path_train = r"C:\poppler-25.07.0\Library\bin"

# -----------------------------------------------------------------------------
# Feature Extraction (13 Features)
# -----------------------------------------------------------------------------
def handle_pdf_conversion_train(pdf_path: str) -> str:
    """Converts a PDF to a temporary PNG for feature extraction during training."""
    global poppler_path_train
    try:
        images = convert_from_path(pdf_path, first_page=1, last_page=1, poppler_path=poppler_path_train if 'poppler_path_train' in globals() else None)
        if not images: return None
        image_path = pdf_path + ".tmp.png"
        images[0].save(image_path, 'PNG')
        return image_path
    except Exception as e:
        print(f"Warning: Could not convert PDF '{os.path.basename(pdf_path)}'. Skipping. Error: {e}")
        return None

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
    return { 'laplacian_variance': float(laplacian_variance), 'noise_variance': float(noise_variance), 'cross_channel_correlation': float(avg_corr) if not np.isnan(avg_corr) else 0.0, 'std_dev_r': std_dev_r, 'std_dev_g': std_dev_g, 'std_dev_b': std_dev_b }

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

# -----------------------------------------------------------------------------
# Main Training Pipeline
# -----------------------------------------------------------------------------
def train():
    features, labels = [], []
    temp_files_to_clean = []
    print("Starting feature extraction for all files...")

    all_files = [os.path.join(REAL_PATH, f) for f in os.listdir(REAL_PATH)] + \
                [os.path.join(FAKE_PATH, f) for f in os.listdir(FAKE_PATH)]
    
    for filepath in all_files:
        label = 0 if REAL_PATH in filepath else 1
        analysis_path = filepath
        
        if filepath.lower().endswith('.pdf'):
            analysis_path = handle_pdf_conversion_train(filepath)
            if analysis_path:
                temp_files_to_clean.append(analysis_path)

        if analysis_path:
            vec = extract_features(analysis_path)
            if vec:
                features.append(vec)
                labels.append(label)

    print(f"Processed {len(features)} total files.")
    
    # Clean up temporary PNGs from PDF conversion
    for f in temp_files_to_clean: os.remove(f)

    if len(features) < 20:
        print("\nFATAL: Dataset is too small. Please add at least 10 diverse files per class.")
        return

    X, y = np.array(features), np.array(labels)
    scaler = StandardScaler().fit(X)
    X_scaled = scaler.transform(X)
    
    print("\nTraining and evaluating the Gradient Boosting model with Cross-Validation...")
    model = GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, max_depth=5, random_state=42)
    scores = cross_val_score(model, X_scaled, y, cv=5, scoring='accuracy')
    
    print(f"\nCross-Validation Scores (5 tests): {scores}")
    print(f"Average Accuracy: {scores.mean() * 100:.2f}% (+/- {scores.std() * 2 * 100:.2f}%)")

    print("\nTraining the final model on the entire dataset...")
    model.fit(X_scaled, y)
    
    saved_model = {'model': model, 'scaler': scaler}
    with open(MODEL_SAVE_PATH, 'wb') as f:
        pickle.dump(saved_model, f)
    print(f"Final model and scaler saved successfully to {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    if not os.path.exists(REAL_PATH) or not os.path.exists(FAKE_PATH):
        os.makedirs(REAL_PATH, exist_ok=True); os.makedirs(FAKE_PATH, exist_ok=True)
        print("Created 'dataset' folders. Please add files and run again.")
    else:
        train()

