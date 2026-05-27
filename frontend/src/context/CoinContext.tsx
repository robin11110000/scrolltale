import { createContext, useContext, useState, type ReactNode } from 'react';
import { getContract, sendTransaction } from 'thirdweb';
import { claimTo } from 'thirdweb/extensions/erc1155';
import { baseSepolia } from 'thirdweb/chains';
import { useActiveAccount } from 'thirdweb/react';
import { client } from './WalletContext';

export interface SeriesPass {
  tier: 'reader' | 'patron';
  tokenId: number;
  mintedAt: number;
  txHash: string;
}

export interface CoinCtx {
  balance: number;
  ownedEpisodes: Set<string>;
  ownedPasses: Map<string, SeriesPass>;
  totalSpent: number;
  episodesRead: number;
  seriesFollowing: number;
  spendCoins: (amount: number, episodeKey: string) => boolean;
  addCoins: (amount: number) => void;
  buyPass: (seriesId: string, tier: 'reader' | 'patron') => Promise<{ success: boolean; txHash?: string; error?: string }>;
  hasAccess: (seriesId: string, requiredTier: 'reader' | 'patron') => boolean;
}

const CoinContext = createContext<CoinCtx | null>(null);

export function CoinProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(350);
  const [ownedEpisodes, setOwnedEpisodes] = useState<Set<string>>(new Set());
  const [ownedPasses, setOwnedPasses] = useState<Map<string, SeriesPass>>(new Map());
  const [totalSpent, setTotalSpent] = useState(0);
  const account = useActiveAccount();

  const spendCoins = (amount: number, episodeKey: string): boolean => {
    if (balance < amount) return false;
    setBalance(b => b - amount);
    setTotalSpent(s => s + amount);
    setOwnedEpisodes(prev => new Set([...prev, episodeKey]));
    return true;
  };

  const addCoins = (amount: number) => setBalance(b => b + amount);

  const buyPass = async (seriesId: string, tier: 'reader' | 'patron'): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!account) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!import.meta.env.VITE_EDITION_DROP_ADDRESS) {
      return { success: false, error: 'Contract address not configured' };
    }

    try {
      const contract = getContract({
        client,
        chain: baseSepolia,
        address: import.meta.env.VITE_EDITION_DROP_ADDRESS,
      });

      // Calculate token ID based on seriesId and tier
      // Token ID mapping: seriesIndex * 2 + (tier === 'patron' ? 1 : 0)
      const seriesIndex = getSeriesIndex(seriesId);
      const passTokenId = seriesIndex * 2 + (tier === 'patron' ? 1 : 0);

      const tx = claimTo({
        contract,
        to: account.address,
        tokenId: BigInt(passTokenId),
        quantity: 1n,
      });

      const result = await sendTransaction({ transaction: tx, account });
      
      // Add to owned passes
      const newPass: SeriesPass = {
        tier,
        tokenId: passTokenId,
        mintedAt: Date.now(),
        txHash: result.transactionHash,
      };
      
      setOwnedPasses(prev => new Map(prev).set(seriesId, newPass));
      
      return { success: true, txHash: result.transactionHash };
    } catch (error) {
      console.error('Pass purchase failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Transaction failed' };
    }
  };

  const hasAccess = (seriesId: string, requiredTier: 'reader' | 'patron'): boolean => {
    const pass = ownedPasses.get(seriesId);
    if (!pass) return false;
    
    // Patron pass grants access to everything, reader pass only grants reader access
    if (requiredTier === 'reader') return true;
    return pass.tier === 'patron';
  };

  // Helper function to map series ID to index
  const getSeriesIndex = (seriesId: string): number => {
    const seriesOrder = ['neon-requiem', 'midnight-bloom', 'void-walker', 'static-hearts', 'crimson-protocol', 'soft-apocalypse'];
    return seriesOrder.indexOf(seriesId);
  };

  return (
    <CoinContext.Provider value={{
      balance,
      ownedEpisodes,
      ownedPasses,
      totalSpent,
      episodesRead: 12,
      seriesFollowing: 3,
      spendCoins,
      addCoins,
      buyPass,
      hasAccess,
    }}>
      {children}
    </CoinContext.Provider>
  );
}

export const useCoins = (): CoinCtx => {
  const ctx = useContext(CoinContext);
  if (!ctx) throw new Error('useCoins must be within CoinProvider');
  return ctx;
};
