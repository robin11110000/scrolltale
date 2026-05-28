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

export const TOKEN_ID_MAP: Record<string, { reader: number; patron: number | null } | null> = {
  'neon-requiem': { reader: 0, patron: 1 },
  'midnight-bloom': { reader: 2, patron: null },
  'void-walker': null,
  'static-hearts': null,
  'crimson-protocol': null,
  'soft-apocalypse': null,
};
