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
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Conectado</span>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{address}</span>
        <button
          onClick={() => disconnect()}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded"
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
        className="text-sm bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50"
        disabled={isConnecting || !injected}
      >
        {isConnecting ? "Conectando…" : "Conectar MetaMask"}
      </button>
      {connectError && <span className="text-xs text-red-600">{connectError.message}</span>}
    </div>
  );
}