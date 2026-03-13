export const POLYGON_CHAIN_ID = 137;

export const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC!;

export const POLYGON_CHAIN = {
  chainId: POLYGON_CHAIN_ID,
  name: "Polygon",
  rpc: POLYGON_RPC_URL,
  blockExplorer: "https://polygonscan.com",
} as const;
