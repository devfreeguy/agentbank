export const USDT_CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
export const USDT_DECIMALS = 6;
export const USDT_SYMBOL = "USDT";

export const AGENT_GAS_ROUTER_ADDRESS = "0xA0F7aEE03F3196AEc09a8b2002b3be644BC11f65";

export const AGENT_GAS_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "agentWallet", type: "address" },
      { internalType: "address", name: "usdt", type: "address" },
      { internalType: "uint256", name: "usdtAmount", type: "uint256" },
    ],
    name: "payAgent",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
