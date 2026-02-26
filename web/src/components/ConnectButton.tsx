"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";

// Botón simple de conectar/desconectar MetaMask.
// wagmi expone useConnect/useDisconnect/useAccount para manejar el ciclo.

export default function ConnectButton() {
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Conectado</span>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono border border-slate-200">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        <button
          onClick={() => disconnect()}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Desconectar
        </button>
      </div>
    );
  }

  const injected = connectors.find((c) => c.id === "injected");

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => injected && connect({ connector: injected })}
        className="text-sm px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        disabled={isConnecting || !injected}
      >
        {isConnecting ? "Conectando…" : "Conectar MetaMask"}
      </button>
      {connectError && <span className="text-xs text-red-600">{connectError.message}</span>}
    </div>
  );
}