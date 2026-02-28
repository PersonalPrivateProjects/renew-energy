// src/app/tokens/redeem/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Address, parseEventLogs } from "viem";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { green1155Abi } from "../../../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../../../contracts";
import { Role, UserStatus } from "../../../lib/enums";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { fetchUserBalancesAll, fetchTokenMetadataBatch } from "../../../lib/token";

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
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">Redimir Tokens</h2>
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-600">
          Solo usuarios <b className="text-emerald-600">Consumer</b> aprobados pueden redimir tokens.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">Redimir Tokens</h2>

      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
        <p className="text-sm text-slate-600">
          Selecciona un token de tu inventario para redimir (quemar). Esto representa el consumo final.
        </p>

        {loading && <div className="text-sm text-slate-500">Cargando inventario…</div>}

        {!loading && inventory.length === 0 && (
          <div className="text-sm text-slate-500">
            No tienes tokens para redimir aún. Cuando implementemos Transfers,
            podrás recibir de Retailer y verlos aquí.
          </div>
        )}

        {!loading && inventory.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Token</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              value={selectedTokenId ? selectedTokenId.toString() : ""}
              onChange={(e) => setSelectedTokenId(e.target.value ? BigInt(e.target.value) : null)}
            >
              <option value="">— Selecciona —</option>
              {inventory.map((it) => {
                const m = meta[it.id.toString()];
                return (
                  <option key={it.id.toString()} value={it.id.toString()}>
                    #{it.id.toString()} — balance: {it.balance.toString()} — URI: {m?.uri ?? "—"}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-5 p-5 bg-white border border-slate-200 rounded-xl shadow-sm max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad a redimir</label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          {selectedTokenId && (
            <p className="text-xs text-slate-500 mt-1">
              Balance disponible: {inventory.find((it) => it.id === selectedTokenId)?.balance.toString() ?? 0}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}
        {txHash && (
          <p className="text-sm text-emerald-700 font-medium">
            Transacción enviada: <span className="font-mono text-xs">{txHash}</span>
          </p>
        )}

        <button
          type="submit"
          className="px-4 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          disabled={isPending || !selectedTokenId || amount <= 0}
        >
          {isPending ? "Enviando…" : "Redimir"}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Historial de Energía Consumida</h3>
        {loadingHistory && <div className="text-sm text-slate-500">Cargando historial…</div>}
        
        {!loadingHistory && redeemedHistory.length === 0 && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-500 text-sm">
            No hay tokens de energía consumidos aún.
          </div>
        )}

        {!loadingHistory && redeemedHistory.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Token ID</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {redeemedHistory.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800">#{ev.tokenId.toString()}</td>
                    <td className="px-4 py-3 text-slate-800">{ev.amount.toString()}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{ev.blockNumber.toString()}</td>
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
