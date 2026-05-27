import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getContract, sendTransaction } from 'thirdweb';
import { claimTo, balanceOf } from 'thirdweb/extensions/erc1155';
import { baseSepolia } from 'thirdweb/chains';
import { useActiveAccount } from 'thirdweb/react';
import { client } from './WalletContext';
import { TOKEN_ID_MAP } from '../lib/contract';

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

  useEffect(() => {
    if (!account?.address) return;
    if (!import.meta.env.VITE_EDITION_DROP_ADDRESS) return;

    const checkOwnedPasses = async () => {
      try {
        const contract = getContract({
          client,
          chain: baseSepolia,
          address: import.meta.env.VITE_EDITION_DROP_ADDRESS,
        });

        const newPasses = new Map<string, SeriesPass>();

        for (const [seriesId, tokenIds] of Object.entries(TOKEN_ID_MAP)) {
          if (!tokenIds) continue;

          const readerBal = await balanceOf({
            contract,
            owner: account.address,
            tokenId: BigInt(tokenIds.reader),
          });
          if (readerBal > 0n) {
            newPasses.set(seriesId, {
              tier: 'reader',
              tokenId: tokenIds.reader,
              mintedAt: Date.now(),
              txHash: '',
            });
          }

          if (tokenIds.patron !== null) {
            const patronBal = await balanceOf({
              contract,
              owner: account.address,
              tokenId: BigInt(tokenIds.patron),
            });
            if (patronBal > 0n) {
              newPasses.set(seriesId, {
                tier: 'patron',
                tokenId: tokenIds.patron,
                mintedAt: Date.now(),
                txHash: '',
              });
            }
          }
        }

        if (newPasses.size > 0) {
          setOwnedPasses(newPasses);
        }
      } catch (err) {
        console.error('Failed to check owned passes:', err);
      }
    };

    checkOwnedPasses();
  }, [account?.address]);

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

    const tokenIds = TOKEN_ID_MAP[seriesId];
    if (!tokenIds) {
      return { success: false, error: 'No on-chain passes available for this series' };
    }

    const tokenId = tier === 'patron' ? tokenIds.patron : tokenIds.reader;
    if (tokenId === null) {
      return { success: false, error: `${tier === 'patron' ? 'Patron' : 'Reader'} pass not available for this series` };
    }

    try {
      const contract = getContract({
        client,
        chain: baseSepolia,
        address: import.meta.env.VITE_EDITION_DROP_ADDRESS,
      });

      const tx = claimTo({
        contract,
        to: account.address,
        tokenId: BigInt(tokenId),
        quantity: 1n,
      });

      const result = await sendTransaction({ transaction: tx, account });

      const newPass: SeriesPass = {
        tier,
        tokenId,
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
    if (requiredTier === 'reader') return true;
    return pass.tier === 'patron';
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
