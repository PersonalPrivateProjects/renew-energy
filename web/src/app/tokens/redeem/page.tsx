// src/app/tokens/redeem/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Address, parseEventLogs } from "viem";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { green1155Abi } from "../../../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../../../contracts";
import { Role, UserStatus } from "../../../lib/enums";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { fetchUserBalancesAll, fetchTokenMetadataBatch } from "../../../lib/token";

function FireIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  );
}

type RedeemedEvent = {
  consumer: Address;
  tokenId: bigint;
  amount: bigint;
  blockNumber: bigint;
  logIndex: number;
};

export default function TokenRedeemPage() {
  const { address, isConnected } = useAccount();
  const { role, status } = useUserStatus();
  const { writeContractAsync, isPending, isSuccess, error } = useWriteContract();
  const client = usePublicClient();

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [inventory, setInventory] = useState<{ id: bigint; balance: bigint }[]>([]);
  const [meta, setMeta] = useState<Record<string, { uri: string; featuresJson: string; parentId: bigint }>>({});
  const [redeemedHistory, setRedeemedHistory] = useState<RedeemedEvent[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>("");
  const successToastHashRef = useRef<string | null>(null);

  const canRedeem = isConnected && status === UserStatus.Approved && role === Role.CONSUMER;

  const loadInventory = useCallback(async () => {
    if (!canRedeem || !address) {
      setInventory([]);
      setMeta({});
      return;
    }
    setLoading(true);
    try {
      const { items } = await fetchUserBalancesAll(address as Address);
      setInventory(items);

      const ids = items.map((x) => x.id);
      const metas = await fetchTokenMetadataBatch(ids);
      const dict: Record<string, any> = {};
      for (const m of metas) dict[m.id.toString()] = m;
      setMeta(dict);
    } finally {
      setLoading(false);
    }
  }, [canRedeem, address]);

  const loadRedeemedHistory = useCallback(async () => {
    if (!client || !address) return;
    setLoadingHistory(true);
    try {
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: 0n,
        toBlock: "latest",
      });

      const decoded = parseEventLogs({
        abi: green1155Abi as any,
        logs,
      }) as { eventName: string; args: Record<string, unknown>; blockNumber?: bigint; logIndex?: number }[];

      const events: RedeemedEvent[] = [];
      for (const ev of decoded) {
        if (ev.eventName === "Redeemed") {
          const args = ev.args as any;
          if (args.consumer.toLowerCase() === address.toLowerCase()) {
            events.push({
              consumer: args.consumer,
              tokenId: args.tokenId,
              amount: args.amount,
              blockNumber: ev.blockNumber || 0n,
              logIndex: ev.logIndex || 0,
            });
          }
        }
      }
      setRedeemedHistory(events.sort((a, b) => Number(b.blockNumber - a.blockNumber)));
    } catch (err) {
      console.error("Error loading redeemed history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [client, address]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (canRedeem) {
      loadRedeemedHistory();
    }
  }, [canRedeem, loadRedeemedHistory]);

  useEffect(() => {
    if (isSuccess) {
      setSelectedTokenId(null);
      setAmount(0);
      setTimeout(() => {
        loadInventory();
        loadRedeemedHistory();
      }, 2500);
    }
  }, [isSuccess, loadInventory, loadRedeemedHistory]);

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    if (successToastHashRef.current === txHash) return;

    successToastHashRef.current = txHash;
    toast.success("Redención completada exitosamente");
  }, [isSuccess, txHash]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRedeem || !selectedTokenId) return;
    if (!amount || amount <= 0) return alert("Amount debe ser > 0");

    const selected = inventory.find((it) => it.id === selectedTokenId);
    if (!selected) return alert("Token no encontrado");
    if (BigInt(amount) > selected.balance) return alert("Cantidad mayor al balance disponible");

    const hash = await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "redeem",
      args: [selectedTokenId, BigInt(amount)]
    });
    setTxHash(String(hash));
  };

  if (!canRedeem) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg">
            <FireIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Redimir Tokens</h2>
            <p className="text-sm text-gray-500">Consumir certificados de energía</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Acceso restringido</p>
              <p className="text-sm mt-1">Solo usuarios <b className="text-orange-600">Consumer</b> aprobados pueden redimir tokens de energía.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg">
          <FireIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Redimir Tokens</h2>
          <p className="text-sm text-gray-500">Consumir certificados de energía renovable</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Selecciona un token de tu inventario para redimir (quemar). Esto representa el consumo final 
          de energía renovable certificada.
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando inventario…
          </div>
        )}

        {!loading && inventory.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            No tienes tokens para redimir aún. Cuando implementemos Transfers,
            podrás recibir de Retailer y verlos aquí.
          </div>
        )}

        {!loading && inventory.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Seleccionar certificado</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              value={selectedTokenId ? selectedTokenId.toString() : ""}
              onChange={(e) => setSelectedTokenId(e.target.value ? BigInt(e.target.value) : null)}
            >
              <option value="">— Selecciona —</option>
              {inventory.map((it) => {
                const m = meta[it.id.toString()];
                return (
                  <option key={it.id.toString()} value={it.id.toString()}>
                    #{it.id.toString()} — Balance: {it.balance.toString()} — {m?.uri ? 'Con metadata' : 'Sin metadata'}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="glass-card rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad a redimir (kWh)</label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            placeholder="Ej: 100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          {selectedTokenId && (
            <p className="text-xs text-gray-500 mt-1">
              Balance disponible: {inventory.find((it) => it.id === selectedTokenId)?.balance.toString() ?? 0}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error.message}
          </div>
        )}
        
        {txHash && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Transacción enviada
            </p>
            <p className="text-xs font-mono text-emerald-600 mt-1 break-all">{txHash}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center gap-2"
          disabled={isPending || !selectedTokenId || amount <= 0}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redimiendo...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FireIcon className="w-4 h-4" />
              Redimir energía
            </span>
          )}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Historial de Energía Consumida
        </h3>
        {loadingHistory && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando historial…
          </div>
        )}
        
        {!loadingHistory && redeemedHistory.length === 0 && (
          <div className="glass-card rounded-xl p-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              No hay tokens de energía consumidos aún.
            </div>
          </div>
        )}

        {!loadingHistory && redeemedHistory.length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Token ID</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {redeemedHistory.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">#{ev.tokenId.toString()}</td>
                    <td className="px-4 py-3 text-gray-800">{ev.amount.toString()} kWh</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{ev.blockNumber.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
