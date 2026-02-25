import { defineChain } from "viem";

// Definición de la chain local de anvil (id por defecto: 31337)
export const anvil = defineChain({
  id: 31337,
  name: "Anvil Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_HTTP ?? "http://127.0.0.1:8545"] }
  }
});