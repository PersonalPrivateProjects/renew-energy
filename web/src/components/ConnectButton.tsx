"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

export default function ConnectButton() {
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-emerald-700">Conectado</span>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg font-mono border border-gray-200">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        <button
          onClick={() => disconnect()}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
        >
          Salir
        </button>
      </div>
    );
  }

  const injected = connectors.find((c) => c.id === "injected");

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => injected && connect({ connector: injected })}
        className="flex items-center gap-2 text-sm px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        disabled={isConnecting || !injected}
      >
        <WalletIcon className="w-4 h-4" />
        {isConnecting ? "Conectando…" : "Conectar Wallet"}
      </button>
      {connectError && <span className="text-xs text-red-600">{connectError.message}</span>}
    </div>
  );
}
