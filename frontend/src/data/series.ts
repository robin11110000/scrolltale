export interface Episode {
  id: string;
  number: number;
  title: string;
  isFree: boolean;
  coinCost: number;
}

export interface Series {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverGradient: string;
  bannerGradient: string;
  accentColor: string;
  episodes: Episode[];
}

const TITLE_BANKS = [
  ['First Light', 'Into the Dark', 'Broken Signal', 'The Rising', 'Neon Surge', 'Shattered', 'Last Frequency', 'Static Rain', 'The Void', 'Final Arc'],
  ['Midnight Call', 'Soft Thunder', 'A Thousand Moons', 'Bloom Protocol', 'Glass Ceiling', 'Whisper Lane', 'Under Stars', 'Last Petal', 'The Long Wait'],
  ['The Keeper', 'Dead Worlds', 'Horizon Zero', 'The Spiral', 'Gravity Well', 'Starfall', 'Between Realms', 'The Summoning', 'Last Gate', 'Convergence'],
];

function makeEpisodes(count: number, bank: number): Episode[] {
  const titles = TITLE_BANKS[bank % TITLE_BANKS.length];
  return Array.from({ length: count }, (_, i) => ({
    id: `ep${i + 1}`,
    number: i + 1,
    title: titles[i] ?? `Chapter ${i + 1}`,
    isFree: i < 3,
    coinCost: i < 3 ? 0 : 10,
  }));
}

export const ALL_SERIES: Series[] = [
  {
    id: 'neon-requiem',
    title: 'Neon Requiem',
    author: 'Yuki Tanaka',
    genre: 'Action',
    description: 'In a city where music is forbidden, a street musician wages a one-person revolution through sound. Every chord is defiance. Every beat could be her last.',
    coverGradient: 'linear-gradient(145deg, #0a0012 0%, #2d0042 55%, #6b0080 100%)',
    bannerGradient: 'linear-gradient(180deg, #0a0012 0%, #2d0042 70%, #000 100%)',
    accentColor: '#9b00cc',
    episodes: makeEpisodes(10, 0),
  },
  {
    id: 'midnight-bloom',
    title: 'Midnight Bloom',
    author: 'Sera Moon',
    genre: 'Romance',
    description: 'Two rival florists forced to share the last greenhouse discover that love, like flowers, needs darkness to bloom. Slow. Soft. Achingly real.',
    coverGradient: 'linear-gradient(145deg, #0d0010 0%, #1f0030 55%, #cc1493 100%)',
    bannerGradient: 'linear-gradient(180deg, #0d0010 0%, #1f0030 70%, #000 100%)',
    accentColor: '#cc1493',
    episodes: makeEpisodes(9, 1),
  },
  {
    id: 'void-walker',
    title: 'Void Walker',
    author: 'Kaz Rem',
    genre: 'Fantasy',
    description: 'A keeper of dead worlds steps into a universe that should not exist. What she finds will unravel everything she knows — and everyone she loves.',
    coverGradient: 'linear-gradient(145deg, #000814 0%, #000e2a 55%, #001a55 100%)',
    bannerGradient: 'linear-gradient(180deg, #000814 0%, #000e2a 70%, #000 100%)',
    accentColor: '#0044ff',
    episodes: makeEpisodes(10, 2),
  },
  {
    id: 'static-hearts',
    title: 'Static Hearts',
    author: 'Jo Hwang',
    genre: 'Slice of Life',
    description: 'A lo-fi producer and the barista who listens to every demo navigate friendship, grief, and the quiet love that sneaks up between playlists.',
    coverGradient: 'linear-gradient(145deg, #0a080a 0%, #181310 55%, #3a2a00 100%)',
    bannerGradient: 'linear-gradient(180deg, #0a080a 0%, #181310 70%, #000 100%)',
    accentColor: '#cc8800',
    episodes: makeEpisodes(8, 0),
  },
  {
    id: 'crimson-protocol',
    title: 'Crimson Protocol',
    author: 'Nyx Adler',
    genre: 'Action',
    description: 'When a rogue AI starts erasing identities, a disgraced hacker and a detective have 72 hours to stop digital annihilation — before they are next.',
    coverGradient: 'linear-gradient(145deg, #100000 0%, #2a0000 55%, #550000 100%)',
    bannerGradient: 'linear-gradient(180deg, #100000 0%, #2a0000 70%, #000 100%)',
    accentColor: '#cc0000',
    episodes: makeEpisodes(10, 1),
  },
  {
    id: 'soft-apocalypse',
    title: 'Soft Apocalypse',
    author: 'Mila Vance',
    genre: 'Romance',
    description: 'The world ended quietly — no explosions, just lights going out. Two strangers find warmth in a library with too many books to read alone.',
    coverGradient: 'linear-gradient(145deg, #050005 0%, #100018 55%, #33006b 100%)',
    bannerGradient: 'linear-gradient(180deg, #050005 0%, #100018 70%, #000 100%)',
    accentColor: '#7700cc',
    episodes: makeEpisodes(9, 2),
  },
];

export const GENRES = ['All', 'Action', 'Romance', 'Fantasy', 'Slice of Life', 'Horror'] as const;
export type GenreFilter = (typeof GENRES)[number];
