import { createContext, useContext, useState, type ReactNode } from 'react';

export interface CoinCtx {
  balance: number;
  ownedEpisodes: Set<string>;
  totalSpent: number;
  episodesRead: number;
  seriesFollowing: number;
  spendCoins: (amount: number, episodeKey: string) => boolean;
  addCoins: (amount: number) => void;
}

const CoinContext = createContext<CoinCtx | null>(null);

export function CoinProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(350);
  const [ownedEpisodes, setOwnedEpisodes] = useState<Set<string>>(new Set());
  const [totalSpent, setTotalSpent] = useState(0);

  const spendCoins = (amount: number, episodeKey: string): boolean => {
    if (balance < amount) return false;
    setBalance(b => b - amount);
    setTotalSpent(s => s + amount);
    setOwnedEpisodes(prev => new Set([...prev, episodeKey]));
    return true;
  };

  const addCoins = (amount: number) => setBalance(b => b + amount);

  return (
    <CoinContext.Provider value={{
      balance,
      ownedEpisodes,
      totalSpent,
      episodesRead: 12,
      seriesFollowing: 3,
      spendCoins,
      addCoins,
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
