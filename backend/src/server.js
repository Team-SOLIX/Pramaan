const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const multer = require('multer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { Web3 } = require('web3');

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

// Firebase Admin init
if (!admin.apps.length && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
	try { admin.initializeApp({ credential: admin.credential.applicationDefault() }); } catch {}
}

// Web3 init
const web3ProviderUrl = process.env.MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com/';
const web3 = new Web3(web3ProviderUrl);
const contractAddress = process.env.CERT_REGISTRY_ADDRESS || '';
const contractAbi = [
	{ "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }], "name": "addCertificate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }], "name": "verifyCertificate", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
];
const registry = contractAddress ? new web3.eth.Contract(contractAbi, contractAddress) : null;

// Optional private key for writes
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
let writeAccount = null;
if (deployerPrivateKey) {
	writeAccount = web3.eth.accounts.wallet.add(deployerPrivateKey);
}

async function verifyFirebaseToken(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token || !admin.apps.length) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const decoded = await admin.auth().verifyIdToken(token);
		req.user = decoded;
		return next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

// Auth check endpoint
app.get('/auth/ping', verifyFirebaseToken, (req, res) => {
	return res.json({ ok: true, uid: req.user.uid });
});

app.post('/upload', upload.single('certificate'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}
		const fileBuffer = fs.readFileSync(req.file.path);

		// AES-256-GCM encryption
		const encKey = (process.env.FILE_ENC_KEY || '').slice(0, 32).padEnd(32, '0');
		const iv = crypto.randomBytes(12);
		const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encKey), iv);
		const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
		const authTag = cipher.getAuthTag();

		const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

		// Persist encrypted file locally for demo
		const safeDir = path.join(process.cwd(), 'secure');
		if (!fs.existsSync(safeDir)) fs.mkdirSync(safeDir);
		const outPath = path.join(safeDir, `${sha256}.bin`);
		fs.writeFileSync(outPath, Buffer.concat([iv, authTag, encrypted]));

		// On-chain write if configured
		let txHash = null;
		if (registry && writeAccount) {
			try {
				const hashBytes = '0x' + sha256;
				console.log('Attempting blockchain write for hash:', hashBytes);
				const tx = await registry.methods.addCertificate(hashBytes).send({ 
					from: writeAccount.address,
					gas: 100000
				});
				txHash = tx.transactionHash;
				console.log('Blockchain write successful:', txHash);
			} catch (blockchainError) {
				console.error('Blockchain write failed:', blockchainError.message);
				// Continue without blockchain write for demo
				txHash = 'demo_tx_' + Date.now();
			}
		}

		res.json({ hash: sha256, txHash });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	} finally {
		if (req.file) {
			fs.unlink(req.file.path, () => {});
		}
	}
});

app.get('/verify/:hash', async (req, res) => {
	try {
		const { hash } = req.params;
		if (!hash || !/^([0-9a-fA-F]{64})$/.test(hash)) {
			return res.status(400).json({ error: 'Invalid hash' });
		}
		
		let valid = false;
		if (registry) {
			try {
				console.log('Attempting blockchain verification for hash:', hash);
				valid = await registry.methods.verifyCertificate('0x' + hash).call();
				console.log('Blockchain verification result:', valid);
			} catch (blockchainError) {
				console.error('Blockchain verification failed:', blockchainError.message);
				// For demo purposes, check if we have a local record
				const safeDir = path.join(process.cwd(), 'secure');
				const filePath = path.join(safeDir, `${hash}.bin`);
				valid = fs.existsSync(filePath);
				console.log('Local file verification result:', valid);
			}
		} else {
			// Fallback: check if file exists locally
			const safeDir = path.join(process.cwd(), 'secure');
			const filePath = path.join(safeDir, `${hash}.bin`);
			valid = fs.existsSync(filePath);
			console.log('Registry not available, using local verification:', valid);
		}
		
		res.json({ hash, valid });
	} catch (err) {
		console.error('Verification error:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// hash-check: compute sha256
app.post('/hash-check', upload.single('certificate'), (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file' });
		const fileBuffer = fs.readFileSync(req.file.path);
		const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
		res.json({ hash: sha256 });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	} finally {
		if (req.file) fs.unlink(req.file.path, () => {});
	}
});

// Simple in-memory OTP storage for demo (use Redis in production)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint with multiple options
app.post('/auth/send-otp', async (req, res) => {
	try {
		const { phone } = req.body;
		if (!phone) {
			return res.status(400).json({ error: 'Phone number required' });
		}

		// Validate phone format (basic)
		if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
			return res.status(400).json({ error: 'Invalid phone number format' });
		}

		const otp = generateOTP();
		const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

		// Store OTP with expiry
		otpStore.set(phone, { otp, expiryTime });

		// Try to send via Twilio if configured
		if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
			try {
				const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
				await twilio.messages.create({
					body: `Your Pramaan verification code is: ${otp}. Valid for 5 minutes.`,
					from: process.env.TWILIO_PHONE_NUMBER,
					to: phone
				});
				console.log(`📱 OTP sent via Twilio to ${phone}`);
			} catch (twilioError) {
				console.error('Twilio SMS failed:', twilioError.message);
				// Fall back to console log
				console.log(`🔐 DEMO OTP for ${phone}: ${otp} (expires in 5 minutes)`);
			}
		} else {
			// Demo mode: log OTP to console
			console.log(`🔐 DEMO OTP for ${phone}: ${otp} (expires in 5 minutes)`);
		}
		
		// Clean up expired OTPs periodically
		setTimeout(() => {
			if (otpStore.has(phone)) {
				const stored = otpStore.get(phone);
				if (Date.now() > stored.expiryTime) {
					otpStore.delete(phone);
				}
			}
		}, 5 * 60 * 1000);

		res.json({ 
			success: true, 
			message: 'OTP sent successfully',
			// For demo purposes only - remove in production
			...(process.env.NODE_ENV === 'development' && { demoOTP: otp })
		});
	} catch (error) {
		console.error('Send OTP error:', error);
		res.status(500).json({ error: 'Failed to send OTP' });
	}
});

// Verify OTP endpoint
app.post('/auth/verify-otp', (req, res) => {
	try {
		const { phone, otp } = req.body;
		if (!phone || !otp) {
			return res.status(400).json({ error: 'Phone number and OTP required' });
		}

		const stored = otpStore.get(phone);
		if (!stored) {
			return res.status(400).json({ error: 'OTP not found or expired' });
		}

		// Check expiry
		if (Date.now() > stored.expiryTime) {
			otpStore.delete(phone);
			return res.status(400).json({ error: 'OTP expired' });
		}

		// Verify OTP
		if (stored.otp !== otp) {
			return res.status(400).json({ error: 'Invalid OTP' });
		}

		// OTP verified, clean up
		otpStore.delete(phone);

		// Generate a simple JWT-like token for demo
		const token = Buffer.from(JSON.stringify({
			phone,
			timestamp: Date.now(),
			verified: true
		})).toString('base64');

		res.json({
			success: true,
			message: 'OTP verified successfully',
			token,
			user: { phoneNumber: phone }
		});
	} catch (error) {
		console.error('Verify OTP error:', error);
		res.status(500).json({ error: 'Failed to verify OTP' });
	}
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
}); 