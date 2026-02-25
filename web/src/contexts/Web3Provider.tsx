"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { anvil } from "../lib/chains";

// Cliente para react-query (requerido por wagmi)
const queryClient = new QueryClient();

// Configuración wagmi v3 (compatible con React 19 + viem 2)
const config = createConfig({
  chains: [anvil],
  connectors: [
    injected({
      shimDisconnect: true, // permite desconexión suave
    }),
  ],
  transports: {
    [anvil.id]: http(
      process.env.NEXT_PUBLIC_RPC_HTTP ??
        "http://127.0.0.1:8545"
    ),
  },
  ssr: true,  // Next 16 soporta esto correctamente
});

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}