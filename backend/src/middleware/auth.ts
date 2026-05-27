import { Request, Response, NextFunction } from 'express';
import { createThirdwebClient, verifySignature } from 'thirdweb';
import jwt from 'jsonwebtoken';

const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID || '',
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    address: string;
    sessionToken: string;
  };
}

export const authenticateWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    req.user = {
      address: decoded.address,
      sessionToken: token
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const verifyWalletSignature = async (
  address: string,
  message: string,
  signature: string
): Promise<boolean> => {
  try {
    const isValid = await verifySignature({
      message,
      signature,
      address,
      client,
    });
    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};