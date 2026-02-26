// src/app/tokens/transform/page.tsx
"use client";

import { useEffect, useState } from "react";
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
  const { writeContractAsync, isPending, error } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<{ id: bigint; balance: bigint }[]>([]);
  const [meta, setMeta] = useState<Record<string, { uri: string; featuresJson: string; parentId: bigint }>>({});
  const [parentId, setParentId] = useState<bigint | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [childUri, setChildUri] = useState<string>("");
  const [features, setFeatures] = useState<string>('{"certificado":true,"kWh":100}');
  const [txHash, setTxHash] = useState<string>("");

  const canTransform = isConnected && status === UserStatus.Approved && role === Role.FACTORY;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!canTransform || !address) {
        setInventory([]);
        setMeta({});
        return;
      }
      setLoading(true);
      try {
        const { items } = await fetchUserBalancesAll(address as Address);
        if (!mounted) return;
        // Muestra cualquier token que tenga la Factory (típicamente materias primas recibidas).
        setInventory(items);

        const ids = items.map((x) => x.id);
        const metas = await fetchTokenMetadataBatch(ids);
        if (!mounted) return;
        const dict: Record<string, any> = {};
        for (const m of metas) dict[m.id.toString()] = m;
        setMeta(dict);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [canTransform, address]);

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
        <h2 className="text-xl font-semibold">Transformar</h2>
        <div className="p-4 border rounded bg-white">
          Solo usuarios <b>Factory</b> aprobados pueden transformar tokens.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Transformar</h2>

      <div className="p-4 border rounded bg-white space-y-3">
        <p className="text-sm text-gray-700">
          Selecciona un <b>parentId</b> de tu inventario (balance &gt; 0). Normalmente son
          materias primas recibidas desde Producer.
        </p>

        {loading && <div>Cargando inventario…</div>}

        {!loading && inventory.length === 0 && (
          <div className="text-sm text-gray-600">
            No tienes tokens para transformar aún. Cuando implementemos Transfers,
            podrás recibir de Producer y verlos aquí.
          </div>
        )}

        {!loading && inventory.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">ParentId</label>
            <select
              className="w-full border rounded p-2"
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

      <form onSubmit={onSubmit} className="space-y-4 p-4 border rounded bg-white max-w-xl">
        <div>
          <label className="block text-sm font-medium">Cantidad a transformar</label>
          <input
            type="number"
            min={1}
            className="mt-1 w-full border rounded p-2"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Child URI (opcional)</label>
          <input
            className="mt-1 w-full border rounded p-2"
            placeholder="ipfs://... o https://..."
            value={childUri}
            onChange={(e) => setChildUri(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">featuresJson (on-chain)</label>
          <textarea
            className="mt-1 w-full border rounded p-2 font-mono text-sm"
            rows={6}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}
        {txHash && (
          <p className="text-sm text-emerald-700">
            Transacción enviada: <span className="font-mono">{txHash}</span>
          </p>
        )}

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isPending || !parentId}
        >
          {isPending ? "Enviando…" : "Transformar"}
        </button>
      </form>
    </div>
  );
}