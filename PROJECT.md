# Pramaan - Blockchain-Based Certificate Verification System

## Project Overview
Pramaan is a decentralized solution to combat fake academic certificates in India using blockchain technology, AI-powered verification, and secure encryption.

## Technology Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- AI Service: Python + Flask
- Blockchain: Solidity + Hardhat (Polygon Mumbai)
- Storage: Firebase
- Authentication: Firebase Phone OTP
- Encryption: AES-256

## Core Features
1. **AI-Powered Tamper Detection**
   - Multiple hashing algorithms (average, perceptual, wavelet)
   - OpenCV-based image analysis
   - Real-time tampering detection

2. **Blockchain Integration**
   - Smart contract for certificate registry
   - Polygon Mumbai testnet deployment
   - Immutable certificate records

3. **Secure Authentication**
   - Firebase Phone OTP
   - Role-based access control
   - Session management

4. **Certificate Management**
   - Upload and verification
   - AES-256 encryption
   - Metadata storage

## Project Structure
```
Pramaan/
├── ai/                    # AI service for tamper detection
├── backend/              # Node.js Express backend
├── blockchain/           # Smart contract and deployment
├── frontend-app/         # React frontend application
└── docs/                # Project documentation
```

## Key Components

### 1. AI Service (Port: 5001)
- Image tamper detection
- Perceptual hashing
- OpenCV processing

### 2. Backend Service (Port: 4000)
- Certificate management
- Blockchain interaction
- Authentication handling
- File encryption

### 3. Frontend Application (Port: 5173)
- User interface
- Certificate upload
- Verification workflow
- Real-time status

### 4. Smart Contract
- Certificate registry
- Hash storage
- Verification logic

## Setup Requirements
1. Node.js 16+
2. Python 3.8+
3. MetaMask wallet
4. Firebase account
5. Polygon Mumbai testnet

## Environment Variables
Required .env files in each directory:
- blockchain/.env
- backend/.env
- frontend-app/.env
- ai/.env

## Development Workflow
1. Start AI service
2. Launch backend server
3. Run frontend application
4. Deploy smart contract

## API Endpoints

### Backend API
- POST /api/certificates/upload
- GET /api/certificates/verify/:hash
- POST /api/auth/login

### AI Service API
- POST /ai/analyze
- GET /ai/health

## Verification Process
1. Certificate upload
2. AI tamper detection
3. Hash generation
4. Blockchain storage
5. Verification using hash

## Security Features
- AES-256 encryption
- Perceptual hashing
- Blockchain immutability
- OTP authentication

## Future Enhancements
1. Multi-chain support
2. Advanced AI detection
3. Batch verification
4. Institution dashboard
5. Mobile application

## Contributing
1. Create feature branch
2. Follow coding standards
3. Write unit tests
4. Submit pull request

## License
MIT License

## Contact
Project maintained by [Your Team Name]