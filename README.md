<<<<<<< HEAD
# Pramaan Skeleton

Pramaan is a blockchain-based certificate verification system with AI tamper detection and OTP authentication.

What’s included:
- Backend: Node.js/Express with Web3.js v4, Firebase OTP, AES-256 encryption
- Frontend: React 18 app (Vite) with OTP login, upload, verify UI
- Blockchain: Solidity `CertificateRegistry` on Polygon Mumbai (Hardhat)
- AI: Python Flask API for image tamper signals via OpenCV

## Prerequisites
- Node.js 18+

## 1) Prerequisites
- Node.js 18+
- npm 9+
- Python 3.10+
- Git

Optional (for Docker):
- Docker Desktop 4+

## 2) Environment Setup

Create environment files from examples:

- `backend/env.example` → create `backend/.env` with these keys:
  - `PORT=4000`
  - `MUMBAI_RPC=https://rpc-mumbai.maticvigil.com/`
  - `CERT_REGISTRY_ADDRESS=<deployed_contract_address>`
  - `DEPLOYER_PRIVATE_KEY=<0x...>` (optional for writes from backend)
  - `FILE_ENC_KEY=<min 32 chars>`
  - `GOOGLE_APPLICATION_CREDENTIALS=service-account.json` (place file in `backend/`)

- `blockchain/env.example` → create `blockchain/.env` with:
  - `MUMBAI_RPC=https://rpc-mumbai.maticvigil.com/`
  - `DEPLOYER_PRIVATE_KEY=<0x...>`
  - `POLYGONSCAN_API_KEY=<your_key>`

- `frontend-app/.env.example` → create `frontend-app/.env` with:
  - `VITE_BACKEND_BASE=http://localhost:4000`
  - `VITE_AI_BASE=http://localhost:5001`
  - Firebase Web config values for OTP

- `ai/.env.example` → create `ai/.env`:
  - `AI_PORT=5001`

### Frontend
Open the static files directly in a browser:
- `frontend/index.html` (Upload)
- `frontend/verify.html` (Verify)

Optionally set backend base:
```
// In browser console, to point to a different backend
localStorage.setItem('backendBase', 'http://localhost:4000')
```

## 3) Install Dependencies

Run these in parallel or sequentially:

```
cd blockchain && npm install && cd ..
cd backend && npm install && cd ..
cd frontend-app && npm install && cd ..
python -m pip install -r ai/requirements.txt
```

## 4) Smart Contract (Hardhat)

Contract: `blockchain/contracts/CertificateRegistry.sol`

Compile and run local node:
```
cd blockchain
npm run compile
npm run node
```

Deploy to local hardhat:
```
npm run deploy:local
# Outputs address into blockchain/deployments/hardhat.json
```

Deploy to Mumbai testnet:
```
# Ensure blockchain/.env is set with MUMBAI_RPC, DEPLOYER_PRIVATE_KEY, POLYGONSCAN_API_KEY
npm run deploy:mumbai
# Optional verification (auto-attempted by script):
npm run verify:mumbai <deployed_address>
```

Deployment artifacts are saved in `blockchain/deployments/<network>.json`.

## 5) Backend (Express + Web3.js + Firebase)

Start backend:
```
cd backend
npm run dev
# Server: http://localhost:4000
```

Endpoints:
- `POST /upload` field `certificate` (writes hash on-chain if configured, returns `{ hash, txHash }`)
- `GET /verify/:hash` → `{ hash, valid }`
- `POST /hash-check` field `certificate` → `{ hash }`

Notes:
- Uses AES-256-GCM to encrypt files into `backend/secure/` for demo
- Uses Firebase Admin token verification if `GOOGLE_APPLICATION_CREDENTIALS` is present

## 6) AI Module (Flask + OpenCV)

Run AI API:
```
python ai/app.py
# API: http://localhost:5001
```

Endpoint:
- `POST /ai/check` field `certificate` → `{ sha256, perceptualHash, tamperLikely }`

## 7) Frontend (React + Vite)

Start frontend:
```
cd frontend-app
npm run dev
# App: http://localhost:5173
```

Features:
- OTP login using Firebase (Recaptcha invisible)
- Upload integrates AI check + backend upload and shows blockchain tx hash
- Verify takes a SHA-256 and shows on-chain validity

## 8) Demo Flow
1. Deploy the contract (local or Mumbai). Copy the contract address
2. Put the address into `backend/.env` as `CERT_REGISTRY_ADDRESS`
3. Start AI API, Backend, and Frontend
4. Login with OTP on the frontend
5. Upload a certificate image; observe returned `hash` and `txHash`
6. Copy `hash` and open Verify tab to confirm `valid: true`

## 9) Troubleshooting
- Backend returns `Invalid hash`: Ensure 64-hex SHA-256 string
- No `txHash` on upload: Provide `DEPLOYER_PRIVATE_KEY` in backend `.env` or use MetaMask from frontend (future enhancement)
- Polygonscan verification fails: Wait a few blocks, ensure correct API key/network
- Firebase OTP issues: Confirm phone auth enabled and web config values in `frontend-app/.env`
- AI errors reading image: Use PNG/JPG; ensure OpenCV installed (`pip show opencv-python`)

## 10) Security & Production Notes
- Replace local secure storage with cloud storage (e.g., Firebase Storage or S3)
- Add input validation and increase rate limits as needed
- Consider gas sponsorship or client-side signing for writes
- Always keep private keys outside of repo and use a secrets manager

## Notes
- `/upload` expects form field name `certificate`.
- Backend currently stores hashes in-memory; replace with on-chain integration later. 
=======
# Pramaan
pramaan - Decentralized Academic record Verification system
>>>>>>> 8a4e2ebb30c89b72f62e141d548b2457d613b953
