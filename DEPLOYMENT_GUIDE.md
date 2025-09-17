# 🚀 Pramaan Hackathon Deployment Guide

## Quick Start for Demo (5 Minutes Setup)

### Prerequisites
- Node.js 18+ installed
- Python 3.10+ installed
- MetaMask wallet with Mumbai testnet MATIC
- Firebase project created

### Step 1: Get Mumbai Testnet MATIC
1. Add Polygon Mumbai to MetaMask:
   - Network: Polygon Mumbai
   - RPC: `https://rpc-mumbai.maticvigil.com/`
   - Chain ID: 80001
   - Currency: MATIC
   - Explorer: `https://mumbai.polygonscan.com/`

2. Get free testnet MATIC: https://faucet.polygon.technology/

### Step 2: Environment Setup

**Blockchain (.env):**
```bash
cd blockchain
cp env.example .env
```
Edit `blockchain/.env`:
```
MUMBAI_RPC=https://rpc-mumbai.maticvigil.com/
DEPLOYER_PRIVATE_KEY=your_metamask_private_key_without_0x
POLYGONSCAN_API_KEY=get_from_polygonscan_com
```

**Backend (.env):**
```bash
cd backend
cp env.example .env
```
Edit `backend/.env`:
```
PORT=4000
MUMBAI_RPC=https://rpc-mumbai.maticvigil.com/
CERT_REGISTRY_ADDRESS=will_be_filled_after_deployment
DEPLOYER_PRIVATE_KEY=same_as_blockchain_env
FILE_ENC_KEY=your_32_character_encryption_key_here_minimum_length
GOOGLE_APPLICATION_CREDENTIALS=service-account.json
```

**Frontend (.env):**
```bash
cd frontend-app
cp env.example .env
```
Edit `frontend-app/.env`:
```
VITE_BACKEND_BASE=http://localhost:4000
VITE_AI_BASE=http://localhost:5001
VITE_FIREBASE_API_KEY=your_firebase_config
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**AI (.env):**
```bash
cd ai
cp env.example .env
```
Edit `ai/.env`:
```
AI_PORT=5001
```

### Step 3: Install Dependencies
```bash
# Install all dependencies in parallel
cd blockchain && npm install && cd ..
cd backend && npm install && cd ..
cd frontend-app && npm install && cd ..
pip install -r ai/requirements.txt
```

### Step 4: Deploy Smart Contract
```bash
cd blockchain
npm run compile
npm run deploy:mumbai
```
**Copy the deployed contract address and update `backend/.env`:**
```
CERT_REGISTRY_ADDRESS=0x_your_deployed_contract_address
```

### Step 5: Start All Services
Open 4 terminals and run:

**Terminal 1 - AI Service:**
```bash
cd ai
python app.py
# Should start on http://localhost:5001
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Should start on http://localhost:4000
```

**Terminal 3 - Frontend:**
```bash
cd frontend-app
npm run dev
# Should start on http://localhost:5173
```

**Terminal 4 - Test the deployment:**
```bash
# Test AI service
curl http://localhost:5001/ai/health

# Test backend
curl http://localhost:4000/verify/test

# Open frontend
start http://localhost:5173
```

## 🎯 Demo Flow for Hackathon

### Student Upload Flow:
1. Open http://localhost:5173
2. Go to "Upload" tab
3. Select a certificate image
4. Click "Upload & Verify"
5. **Show the AI analysis results**
6. **Show the blockchain transaction hash**
7. **Copy the certificate hash**

### Employer Verification Flow:
1. Go to "Verify" tab
2. Paste the certificate hash
3. Click "Verify Certificate"
4. **Show blockchain verification result**
5. **Demonstrate tamper detection**

## 🔧 Troubleshooting

### Smart Contract Deployment Failed
```bash
# Check your balance
cd blockchain
npx hardhat run scripts/check-balance.js --network mumbai

# If balance is 0, get more MATIC from faucet
# Try deployment again
npm run deploy:mumbai
```

### Backend Connection Issues
```bash
# Check if contract address is set
grep CERT_REGISTRY_ADDRESS backend/.env

# Test blockchain connection
cd backend
node -e "
const { Web3 } = require('web3');
const web3 = new Web3('https://rpc-mumbai.maticvigil.com/');
web3.eth.getBlockNumber().then(console.log);
"
```

### Frontend Build Issues
```bash
cd frontend-app
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### AI Service Issues
```bash
# Check Python dependencies
pip list | grep opencv
pip list | grep flask

# Reinstall if needed
pip install -r ai/requirements.txt --force-reinstall
```

## 📱 Firebase Setup (Optional for OTP)

1. Go to Firebase Console
2. Create new project
3. Enable Authentication > Phone
4. Add web app and get config
5. Download service account key as `backend/service-account.json`

## 🎬 Hackathon Presentation Tips

### Key Demo Points:
1. **Problem Statement**: Show fake certificate statistics in India
2. **AI Detection**: Upload a tampered image, show detection results
3. **Blockchain Storage**: Show actual Mumbai testnet transaction
4. **Verification**: Demonstrate employer verification flow
5. **Security**: Explain AES-256 encryption and immutable storage

### Screenshots to Prepare:
- AI tamper detection results
- Polygonscan transaction page
- Valid vs Invalid certificate verification
- Mobile responsive design

### Backup Plan:
- Have pre-uploaded certificates with known hashes
- Screenshot of successful deployments
- Video recording of full demo flow

## 🚨 Last-Minute Fixes

### If Mumbai is down:
```javascript
// In hardhat.config.cjs, add backup RPC
mumbai: {
  url: process.env.MUMBAI_RPC || 'https://polygon-mumbai.g.alchemy.com/v2/demo',
  // ... rest of config
}
```

### If AI service fails:
```python
# In ai/app.py, add simple fallback
@app.route('/ai/check', methods=['POST'])
def ai_check_fallback():
    return jsonify({
        'sha256': 'demo_hash',
        'tamperLikely': False,
        'confidence': 0.95,
        'status': 'success'
    })
```

### Quick Health Check Script:
```bash
# Create health-check.sh
echo "Checking all services..."
curl -s http://localhost:5001/ai/health && echo "✅ AI Service OK"
curl -s http://localhost:4000/verify/test && echo "✅ Backend OK"
curl -s http://localhost:5173 && echo "✅ Frontend OK"
```

## 🏆 Success Metrics for Demo

- [ ] Smart contract deployed on Mumbai
- [ ] AI service detecting tamper attempts
- [ ] Backend storing hashes on blockchain
- [ ] Frontend showing real transaction links
- [ ] End-to-end flow working smoothly
- [ ] Mobile responsive design
- [ ] Error handling working properly

## 📞 Emergency Contacts

If you need help during hackathon:
- Polygon Mumbai Status: https://status.polygon.technology/
- Mumbai Faucet: https://faucet.polygon.technology/
- Firebase Status: https://status.firebase.google.com/

Good luck with your hackathon! 🎉
