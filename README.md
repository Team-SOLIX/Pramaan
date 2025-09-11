# Pramaan Skeleton

Minimal full-stack skeleton:
- Backend: Node.js/Express with `/upload` and `/verify/:hash`
- Frontend: Static pages (`frontend/index.html`, `frontend/verify.html`)
- Blockchain: Solidity `CertificateRegistry` with Hardhat

## Prerequisites
- Node.js 18+

## Setup

### Backend
```
cd backend
npm install
npm run dev
```
Server runs on http://localhost:4000

### Frontend
Open the static files directly in a browser:
- `frontend/index.html` (Upload)
- `frontend/verify.html` (Verify)

Optionally set backend base:
```
// In browser console, to point to a different backend
localStorage.setItem('backendBase', 'http://localhost:4000')
```

### Blockchain (Hardhat)
```
cd blockchain
npm install
npm run compile
npm run node
# in another terminal
npm run deploy:local
```

Contract: `contracts/CertificateRegistry.sol`

## Notes
- `/upload` expects form field name `certificate`.
- Backend currently stores hashes in-memory; replace with on-chain integration later. 