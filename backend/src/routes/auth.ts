import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyWalletSignature } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate challenge message for wallet to sign
router.post('/challenge', (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address required' });
  }

  const timestamp = Date.now();
  const message = `Sign this message to authenticate with Scrolltale.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;
  
  res.json({ message, timestamp });
});

// Verify signature and create session
router.post('/verify', async (req, res) => {
  const { address, message, signature } = req.body;
  
  if (!address || !message || !signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const isValid = await verifyWalletSignature(address, message, signature);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Create JWT session token
    const sessionToken = jwt.sign(
      { address, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      sessionToken,
      address,
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user info
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    res.json({
      address: decoded.address,
      authenticated: true
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;