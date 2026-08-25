"use client";

import { useAccount } from "wagmi";
import { useAnvilNetwork } from "../hooks/useAnvilNetwork";

export default function NetworkStatusPill() {
  const { isConnected } = useAccount();
  const { chainId, expectedChainId, isOnAnvil, isSwitching, switchToAnvil, switchError } = useAnvilNetwork();

  if (!isConnected) {
    return (
      <span className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-100 text-xs text-slate-600">
        Red desconectada
      </span>
    );
  }

  if (isOnAnvil) {
    return (
      <span className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
        Anvil {expectedChainId}
      </span>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-2">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-xs text-amber-700">
        Chain {chainId} no válida
      </span>
      <button
        onClick={switchToAnvil}
        disabled={isSwitching}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {isSwitching ? "Cambiando..." : "Cambiar a 31337"}
      </button>
      {switchError && <span className="text-xs text-red-600">{switchError.message}</span>}
    </div>
  );
}
