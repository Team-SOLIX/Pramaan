# -----------------------------------------------------------------------------
# Pramaan AI Detector - ML Edition (Definitive Edition with PDF Support)
#
# This API uses a pre-trained model for images and a special protocol for
# PDFs, recognizing the limitations of forensic analysis on converted files.
# -----------------------------------------------------------------------------

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import numpy as np
import os
import hashlib
from dotenv import load_dotenv
from PIL import Image
import pickle
import pytesseract
import piexif
from pdf2image import convert_from_path

# --- Configuration ---
# On Windows, you MUST provide the full path to your Poppler bin directory.
# 1. Uncomment the line below.
# 2. Replace the path with the correct path from your system.
poppler_path = r"C:\poppler-25.07.0\Library\bin"

# If Tesseract is not in your system PATH, you must also set this path.
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = os.path.join(os.getcwd(), 'ai_uploads')
MODEL_PATH = 'pramaan_model.pkl'
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# Load the Trained Model and Scaler
# -----------------------------------------------------------------------------
try:
    with open(MODEL_PATH, 'rb') as f:
        saved_model = pickle.load(f)
        model = saved_model['model']
        scaler = saved_model['scaler']
    print("Machine Learning model and scaler loaded successfully.")
except FileNotFoundError:
    print(f"FATAL: Model file not found at {MODEL_PATH}. Please run train_model.py first.")
    model = scaler = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = scaler = None

# -----------------------------------------------------------------------------
# Feature Extraction (Must be IDENTICAL to the trainer)
# -----------------------------------------------------------------------------
def handle_pdf_conversion(pdf_path: str) -> str:
    """Converts the first page of a PDF to a PNG image for analysis."""
    global poppler_path
    try:
        images = convert_from_path(pdf_path, first_page=1, last_page=1, poppler_path=poppler_path if 'poppler_path' in globals() else None)
        if not images: return None
        image_path = pdf_path + ".png"
        images[0].save(image_path, 'PNG')
        return image_path
    except Exception as e:
        print(f"PDF conversion failed: {e}")
        return None

def is_certificate(filepath: str) -> tuple[bool, str]:
    """Uses OCR with preprocessing to check for certificate keywords."""
    try:
        image = cv2.imread(filepath)
        if image is None: return False, "Invalid image format."
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        text = pytesseract.image_to_string(thresh, timeout=10)
        keywords = ['certificate', 'completion', 'award', 'certify', 'diploma', 'training', 'course', 'successfully completed']
        if any(keyword in text.lower() for keyword in keywords):
            return True, "Certificate keywords found."
        else:
            return False, "Content Analysis Failed: The document does not contain certificate-related keywords."
    except pytesseract.TesseractNotFoundError:
        return False, "OCR Error: Tesseract is not installed or configured correctly."
    except Exception as e:
        return False, f"An unexpected OCR error occurred: {str(e)}"

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
        if image is None: return None, None
        other_metrics = analyze_forensic_metrics(image)
        full_metrics = {**ela_metrics, **exif_metrics, **other_metrics}
        
        feature_vector = np.array([[ 
            ela_metrics['ela_mean'], ela_metrics['ela_std'], ela_metrics['ela_max'], ela_metrics['ela_contrast'], 
            other_metrics['laplacian_variance'], other_metrics['noise_variance'], 
            other_metrics['cross_channel_correlation'], other_metrics['std_dev_r'], 
            other_metrics['std_dev_g'], other_metrics['std_dev_b'], 
            exif_metrics['software_tag'], exif_metrics['has_date_info'] 
        ]])
        return feature_vector, full_metrics
    except Exception:
        return None, None

# -----------------------------------------------------------------------------
# Flask API Routes
# -----------------------------------------------------------------------------
@app.route('/ai/check', methods=['POST'])
def ai_check():
    if model is None or scaler is None:
        return jsonify({'error': 'ML model or scaler is not loaded.'}), 503

    if 'certificate' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    f = request.files['certificate']
    if f.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(f.filename)
    filepath = os.path.join(UPLOAD_DIR, filename)
    f.save(filepath)
    
    analysis_path = filepath
    is_pdf = filename.lower().endswith('.pdf')
    if is_pdf:
        analysis_path = handle_pdf_conversion(filepath)
        if not analysis_path:
            return jsonify({'error': 'Failed to convert PDF. Ensure Poppler is configured.'}), 500

    try:
        # Run OCR check first, as it's our gatekeeper for all file types.
        is_cert, ocr_message = is_certificate(analysis_path)
        if not is_cert:
            return jsonify({'status': 'rejected', 'tamperLikely': True, 'confidence': 1.0, 'reasons': [ocr_message]})

        # Extract features for all file types that pass OCR.
        features, metrics = extract_features(analysis_path)
        if features is None:
            return jsonify({'error': 'Could not extract features from image.'}), 400

        # --- NEW: PDF Protocol Logic ---
        # A converted PDF will have a unique forensic signature. We check for it here.
        is_converted_pdf_signature = is_pdf or \
            (metrics.get('laplacian_variance', 0) > 800 and 
             metrics.get('ela_mean', 10) < 2.0 and 
             metrics.get('has_date_info', 1) == 0.0)

        if is_converted_pdf_signature:
            # For PDFs, we cannot reliably use the ML model. The verdict is based on passing the OCR check.
            tamper_likely = False
            confidence = 0.80 # Lower confidence to indicate uncertainty
            reasons = [
                "The document was identified as a certificate based on its content.",
                "WARNING: This file is a PDF or has the signature of a converted document. Advanced forensic analysis for tampering is less reliable. Manual verification is advised."
            ]
        else:
            # This is a standard image, so we use the full power of the ML model.
            features_scaled = scaler.transform(features)
            prediction = model.predict(features_scaled)[0]
            probabilities = model.predict_proba(features_scaled)[0]

            tamper_likely = bool(prediction == 1)
            confidence = float(probabilities[prediction])
            reasons = [f"The model predicts this certificate is {'FAKE' if tamper_likely else 'REAL'} with {confidence:.2%} confidence."]
        
        with open(filepath, 'rb') as fh: raw = fh.read()
        sha = hashlib.sha256(raw).hexdigest()

        return jsonify({
            'sha256': sha,
            'tamperLikely': tamper_likely,
            'confidence': confidence,
            'reasons': reasons,
            'metrics': metrics,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
        if is_pdf and analysis_path and os.path.exists(analysis_path) and analysis_path != filepath:
            os.remove(analysis_path)

@app.route('/ai/health', methods=['GET'])
def health_check():
    status = 'healthy' if model is not None else 'degraded (ML model not loaded)'
    return jsonify({'status': status, 'service': 'Pramaan AI Detector (Definitive Edition)'})

if __name__ == '__main__':
    port = int(os.environ.get('AI_PORT', '5011'))
    app.run(host='0.0.0.0', port=port)

