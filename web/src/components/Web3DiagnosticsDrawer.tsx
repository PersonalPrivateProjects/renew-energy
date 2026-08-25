"use client";

import { useState } from "react";
import { useAnvilNetwork } from "../hooks/useAnvilNetwork";
import { useDiagnosticsStore } from "../lib/diagnosticsStore";

export default function Web3DiagnosticsDrawer() {
  const [open, setOpen] = useState(false);
  const { chainId, expectedChainId, isOnAnvil } = useAnvilNetwork();
  const { txEntries, logs, clear } = useDiagnosticsStore();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-slate-700"
      >
        Diagnóstico Web3
      </button>

      {open && (
        <div className="mt-2 w-[360px] max-w-[92vw] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Consola de diagnóstico</h3>
            <button onClick={clear} className="text-xs text-slate-500 hover:text-slate-700">Limpiar</button>
          </div>

          <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
            chain actual: {chainId} | esperada: {expectedChainId} | {isOnAnvil ? "OK" : "Incorrecta"}
          </div>

          <div className="mt-3 space-y-2 max-h-36 overflow-auto pr-1">
            <p className="text-xs font-semibold text-slate-700">Transacciones</p>
            {txEntries.length === 0 && <p className="text-xs text-slate-500">Sin transacciones capturadas.</p>}
            {txEntries.map((tx) => (
              <div key={tx.hash} className="rounded-lg border border-slate-200 px-2 py-2 text-xs">
                <p className="font-medium text-slate-800">{tx.phase.toUpperCase()}</p>
                <p className="break-all text-slate-600">{tx.hash}</p>
                {tx.gasEstimate && <p className="text-slate-500">gas estimado: {tx.gasEstimate}</p>}
                {tx.gasUsed && <p className="text-slate-500">gas usado: {tx.gasUsed}</p>}
                {tx.errorMessage && <p className="text-red-600">{tx.errorMessage}</p>}
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2 max-h-36 overflow-auto pr-1">
            <p className="text-xs font-semibold text-slate-700">Eventos recientes</p>
            {logs.length === 0 && <p className="text-xs text-slate-500">Sin logs.</p>}
            {logs.map((log, idx) => (
              <div key={`${log.eventName}-${idx}`} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
                <p className="text-slate-800">{log.eventName}</p>
                {log.blockNumber && <p className="text-slate-500">bloque #{log.blockNumber}</p>}
                {log.txHash && <p className="break-all text-slate-500">{log.txHash}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
