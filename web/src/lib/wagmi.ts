// src/lib/wagmi.ts
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { anvil } from "../lib/chains";

// Configuración wagmi v3 (compatible con React 19 + viem 2)
// ÚNICA instancia de config para toda la app
export const config = createConfig({
  chains: [anvil],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [anvil.id]: http(process.env.NEXT_PUBLIC_RPC_HTTP ?? "http://127.0.0.1:8545"),
  },
  ssr: true,
});
