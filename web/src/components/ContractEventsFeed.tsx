"use client";

import { useEffect } from "react";
import { useContractActivityFeed } from "../hooks/useContractActivityFeed";
import { useDiagnosticsStore } from "../lib/diagnosticsStore";

export default function ContractEventsFeed() {
  const { items, loading, error, refetch } = useContractActivityFeed(15);
  const pushLog = useDiagnosticsStore((s) => s.pushLog);

  useEffect(() => {
    for (const it of items.slice(0, 5)) {
      pushLog({
        eventName: it.eventName,
        txHash: it.txHash,
        blockNumber: it.blockNumber.toString(),
        createdAt: Date.now(),
      });
    }
  }, [items, pushLog]);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">Feed de eventos on-chain</h4>
        <button onClick={refetch} className="text-xs text-emerald-700 hover:text-emerald-600">Actualizar</button>
      </div>

      {loading && <p className="text-sm text-slate-500 mt-3">Cargando eventos...</p>}
      {error && <p className="text-sm text-red-600 mt-3">{error.message}</p>}

      {!loading && !error && (
        <div className="mt-3 space-y-2 max-h-72 overflow-auto pr-1">
          {items.length === 0 && <p className="text-sm text-slate-500">Aún no hay eventos.</p>}
          {items.map((item, idx) => (
            <div key={`${item.blockNumber.toString()}-${item.logIndex}-${idx}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs font-semibold text-slate-800">{item.eventName}</p>
              <p className="text-xs text-slate-500">bloque #{item.blockNumber.toString()}</p>
              {item.txHash && <p className="text-xs text-slate-600 break-all">{item.txHash}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
