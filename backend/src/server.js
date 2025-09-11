import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

// In-memory set to simulate on-chain storage for now
const certificateHashes = new Set();

app.post('/upload', upload.single('certificate'), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}
		const fileBuffer = fs.readFileSync(req.file.path);
		const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
		certificateHashes.add(hash);
		res.json({ hash });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	} finally {
		if (req.file) {
			fs.unlink(req.file.path, () => {});
		}
	}
});

app.get('/verify/:hash', (req, res) => {
	const { hash } = req.params;
	const exists = certificateHashes.has(hash);
	res.json({ hash, valid: exists });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
}); 