// src/app/tokens/transform/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { green1155Abi } from "../../../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../../../contracts";
import { Role, UserStatus } from "../../../lib/enums";
import { tryParseJson } from "../../../lib/json";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { fetchUserBalancesAll, fetchTokenMetadataBatch } from "../../../lib/token";

export default function TokenTransformPage() {
  const { address, isConnected } = useAccount();
  const { role, status } = useUserStatus();
  const { writeContractAsync, isPending, isSuccess, error } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<{ id: bigint; balance: bigint }[]>([]);
  const [meta, setMeta] = useState<Record<string, { uri: string; featuresJson: string; parentId: bigint }>>({});
  const [parentId, setParentId] = useState<bigint | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [childUri, setChildUri] = useState<string>("");
  const [features, setFeatures] = useState<string>('{"certificado":true,"kWh":100}');
  const [txHash, setTxHash] = useState<string>("");

  const canTransform = isConnected && status === UserStatus.Approved && role === Role.FACTORY;

  const loadInventory = useCallback(async () => {
    if (!canTransform || !address) {
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
  }, [canTransform, address]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (isSuccess) {
      setParentId(null);
      setAmount(0);
      setChildUri("");
      setFeatures('{"certificado":true,"kWh":100}');
      setTimeout(() => loadInventory(), 2500);
    }
  }, [isSuccess, loadInventory]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canTransform || !parentId) return;
    if (!amount || amount <= 0) return alert("Amount debe ser > 0");

    const chk = tryParseJson(features);
    if (!chk.ok) return alert("featuresJson inválido: " + chk.error);

    const hash = await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "transform",
      args: [parentId, BigInt(amount), childUri.trim(), features.trim()]
    });
    setTxHash(String(hash));
  };

  if (!canTransform) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">Transformar</h2>
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-600">
          Solo usuarios <b className="text-emerald-600">Factory</b> aprobados pueden transformar tokens.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">Transformar</h2>

      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
        <p className="text-sm text-slate-600">
          Selecciona un <b className="text-slate-800">parentId</b> de tu inventario (balance &gt; 0). Normally son
          materias primas recibidas desde Producer.
        </p>

        {loading && <div className="text-sm text-slate-500">Cargando inventario…</div>}

        {!loading && inventory.length === 0 && (
          <div className="text-sm text-slate-500">
            No tienes tokens para transformar aún. Cuando implementemos Transfers,
            podrás recibir de Producer y verlos aquí.
          </div>
        )}

        {!loading && inventory.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ParentId</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              value={parentId ? parentId.toString() : ""}
              onChange={(e) => setParentId(e.target.value ? BigInt(e.target.value) : null)}
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad a transformar</label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Child URI (opcional)</label>
          <input
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            placeholder="ipfs://... o https://..."
            value={childUri}
            onChange={(e) => setChildUri(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">featuresJson (on-chain)</label>
          <textarea
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 resize-none"
            rows={6}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}
        {txHash && (
          <p className="text-sm text-emerald-700 font-medium">
            Transacción enviada: <span className="font-mono text-xs">{txHash}</span>
          </p>
        )}

        <button
          type="submit"
          className="px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          disabled={isPending || !parentId}
        >
          {isPending ? "Enviando…" : "Transformar"}
        </button>
      </form>
    </div>
  );
}
