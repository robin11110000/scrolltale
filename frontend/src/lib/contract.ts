import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { client } from "../context/WalletContext";

const EDITION_DROP_ADDRESS = import.meta.env.VITE_EDITION_DROP_ADDRESS;

export function getPassContract() {
  return getContract({
    client,
    chain: baseSepolia,
    address: EDITION_DROP_ADDRESS,
  });
}

export const TOKEN_ID_MAP: Record<string, { patron: number } | null> = {
  'neon-requiem': { patron: 1 },
  'midnight-bloom': { patron: 2 },
  'void-walker': null,
  'static-hearts': null,
  'crimson-protocol': null,
  'soft-apocalypse': null,
};
