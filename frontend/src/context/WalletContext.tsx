import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createThirdwebClient } from 'thirdweb';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connecting: boolean;
  sessionToken: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'demo-client-id',
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on load
    const token = localStorage.getItem('scrolltale_session');
    if (token) {
      setSessionToken(token);
      // Verify token with backend
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.address) {
          setAddress(data.address);
          setIsConnected(true);
        } else {
          localStorage.removeItem('scrolltale_session');
        }
      })
      .catch(() => {
        localStorage.removeItem('scrolltale_session');
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      setConnecting(true);
      
      // Note: This is a simplified version - in production you'd use Thirdweb's 
      // ConnectWallet component and hooks properly
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const userAddress = accounts[0];
          
          // Get challenge from backend
          const challengeRes = await fetch('/api/auth/challenge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: userAddress })
          });
          const { message } = await challengeRes.json();
          
          // Sign challenge
          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, userAddress]
          });
          
          // Verify signature and get session token
          const verifyRes = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: userAddress,
              message,
              signature
            })
          });
          
          const { sessionToken: token } = await verifyRes.json();
          
          // Store session
          localStorage.setItem('scrolltale_session', token);
          setSessionToken(token);
          setAddress(userAddress);
          setIsConnected(true);
        }
      } else {
        alert('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('scrolltale_session');
    setSessionToken(null);
    setAddress(null);
    setIsConnected(false);
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!address || typeof window.ethereum === 'undefined') return null;
    
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      return null;
    }
  };

  const value = {
    isConnected,
    address,
    connecting,
    sessionToken,
    connectWallet,
    disconnectWallet,
    signMessage,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}