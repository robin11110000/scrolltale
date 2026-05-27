import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { useActiveAccount, useDisconnect } from 'thirdweb/react';

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'demo-client-id',
});

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

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

export function WalletProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('scrolltale_session');
    if (token) {
      setSessionToken(token);
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

  useEffect(() => {
    if (!account?.address) return;
    const existingToken = localStorage.getItem('scrolltale_session');
    if (existingToken) return;
    authenticateWithWallet(account);
  }, [account?.address]);

  const authenticateWithWallet = async (acc: typeof account) => {
    if (!acc?.address) return;
    setConnecting(true);
    try {
      const challengeRes = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: acc.address })
      });
      const { message } = await challengeRes.json();

      const signature = await acc.signMessage({ message });

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: acc.address, message, signature })
      });

      const { sessionToken: token } = await verifyRes.json();
      localStorage.setItem('scrolltale_session', token);
      setSessionToken(token);
      setAddress(acc.address);
      setIsConnected(true);
    } catch (error) {
      console.error('Wallet authentication failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const connectWallet = async () => {
    console.warn('Use the ConnectButton component to connect a wallet');
  };

  const disconnectWallet = () => {
    disconnect();
    localStorage.removeItem('scrolltale_session');
    setSessionToken(null);
    setAddress(null);
    setIsConnected(false);
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!account) return null;
    try {
      return await account.signMessage({ message });
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
