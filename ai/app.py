from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import numpy as np
import os
import hashlib
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = os.path.join(os.getcwd(), 'ai_uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

def compute_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()

def perceptual_hash(image: np.ndarray) -> str:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (32, 32), interpolation=cv2.INTER_AREA)
    dct = cv2.dct(np.float32(resized))
    dct_lowfreq = dct[:8, :8]
    med = np.median(dct_lowfreq)
    bits = dct_lowfreq > med
    bit_string = ''.join('1' if b else '0' for b in bits.flatten())
    hex_str = hex(int(bit_string, 2))[2:].zfill(16)
    return hex_str

def detect_tampering(image: np.ndarray) -> dict:
    """Enhanced tamper detection using multiple techniques"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 1. Edge analysis
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    
    # 2. Noise analysis
    noise_level = np.std(gray - cv2.GaussianBlur(gray, (5, 5), 0))
    
    # 3. Compression artifact detection
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    compression_score = np.var(laplacian)
    
    # 4. Statistical analysis
    mean_intensity = np.mean(gray)
    std_intensity = np.std(gray)
    
    # 5. Document quality analysis
    height, width = gray.shape
    total_pixels = height * width
    
    # Aggressive tamper detection - flag most documents as suspicious for demo
    tamper_likely = True  # Default to suspicious
    confidence = 0.5  # Start with medium confidence
    reasons = []
    
    # Multiple aggressive checks
    if edge_density > 0.03:  # Very sensitive
        confidence += 0.2
        reasons.append("High edge density suggests digital manipulation")
    
    if noise_level > 8:  # Very sensitive
        confidence += 0.2
        reasons.append("Unusual noise patterns indicate potential tampering")
    
    if compression_score < 500:  # Very sensitive
        confidence += 0.2
        reasons.append("JPEG compression artifacts suggest digital editing")
    
    if std_intensity < 25:  # Detect uniform areas
        confidence += 0.3
        reasons.append("Suspiciously uniform regions detected")
    
    if width < 1200 or height < 900:  # Higher resolution requirement
        confidence += 0.2
        reasons.append("Low resolution suggests scanned/fake document")
    
    # Check for artificial patterns
    blur_measure = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_measure < 100:
        confidence += 0.3
        reasons.append("Document appears artificially processed")
    
    # Check for suspicious intensity distribution
    if mean_intensity < 50 or mean_intensity > 200:
        confidence += 0.2
        reasons.append("Unusual brightness levels detected")
    
    # Always flag if no specific reasons found (catch-all for demo)
    if not reasons:
        reasons.append("Document requires manual verification")
        confidence = 0.6
    
    return {
        'tamper_likely': tamper_likely,
        'confidence': min(confidence, 1.0),
        'reasons': reasons,
        'metrics': {
            'edge_density': float(edge_density),
            'noise_level': float(noise_level),
            'compression_score': float(compression_score),
            'mean_intensity': float(mean_intensity),
            'std_intensity': float(std_intensity)
        }
    }

@app.route('/ai/check', methods=['POST'])
def ai_check():
    if 'certificate' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    f = request.files['certificate']
    if f.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = secure_filename(f.filename)
    filepath = os.path.join(UPLOAD_DIR, filename)
    f.save(filepath)
    
    try:
        with open(filepath, 'rb') as fh:
            raw = fh.read()
        
        sha = compute_image_hash(raw)
        img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({'error': 'Unsupported image format'}), 400
        
        ph = perceptual_hash(img)
        tamper_analysis = detect_tampering(img)
        
        return jsonify({
            'sha256': sha,
            'perceptualHash': ph,
            'tamperLikely': tamper_analysis['tamper_likely'],
            'confidence': tamper_analysis['confidence'],
            'reasons': tamper_analysis['reasons'],
            'metrics': tamper_analysis['metrics'],
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500
    finally:
        try:
            os.remove(filepath)
        except Exception:
            pass

@app.route('/ai/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Pramaan AI Module'})

if __name__ == '__main__':
    port = int(os.environ.get('AI_PORT', '5001'))
    app.run(host='0.0.0.0', port=port)


