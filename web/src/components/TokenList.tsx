// src/components/TokenList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import TokenCard from "./TokenCard";
import { fetchTokenMetadataBatch, fetchUserBalancesAll } from "../lib/token";
import Link from "next/link";
import { Role } from "../lib/enums";
import { useUserStatus } from "../hooks/useUserStatus";

// Lista los tokens (id + balance) del usuario y obtiene metadatos (uri, features, parent)
export default function TokenList() {
  const { address, isConnected } = useAccount();
  const { role } = useUserStatus();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ id: bigint; balance: bigint }[]>([]);
  const [meta, setMeta] = useState<Record<string, { uri: string; featuresJson: string; parentId: bigint }>>({});

  const canMint = useMemo(() => role === Role.PRODUCER, [role]);
  const canTransform = useMemo(() => role === Role.FACTORY, [role]);
  const canRedeem = useMemo(() => role === Role.CONSUMER, [role]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!isConnected || !address) {
        setItems([]);
        setMeta({});
        return;
      }
      setLoading(true);
      try {
        const { items } = await fetchUserBalancesAll(address as Address);
        if (!mounted) return;
        setItems(items);

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
  }, [isConnected, address]);

  if (!isConnected) {
    return <div className="p-4 border rounded bg-white">Conéctate con MetaMask para ver tus tokens.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {canMint && (
          <Link
            href="/tokens/create"
            className="bg-emerald-600 text-white px-3 py-2 rounded text-sm"
          >
            + Crear materia prima
          </Link>
        )}
        {canTransform && (
          <Link
            href="/tokens/transform"
            className="bg-indigo-600 text-white px-3 py-2 rounded text-sm"
          >
            ⇄ Transformar
          </Link>
        )}
        {canRedeem && (
          <Link
            href="/tokens/redeem"
            className="bg-orange-600 text-white px-3 py-2 rounded text-sm"
          >
            🔥 Redimir
          </Link>
        )}
      </div>

      {loading && <div className="p-4 border rounded bg-white">Cargando tus tokens…</div>}

      {!loading && items.length === 0 && (
        <div className="p-4 border rounded bg-white">
          <p>No tienes tokens aún.</p>
          <p className="text-sm text-gray-600">
            {canMint
              ? "Crea un token de materia prima desde '+ Crear materia prima'."
              : canTransform
              ? "Recibe materias primas (desde Producer) para poder transformarlas."
              : canRedeem
              ? "Recibe tokens certificados (desde Retailer) para poder redimirlos."
              : "Recibe tokens desde el rol anterior en el flujo para verlos aquí."}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => {
          const m = meta[it.id.toString()];
          return (
            <TokenCard
              key={it.id.toString()}
              id={it.id}
              balance={it.balance}
              uri={m?.uri ?? ""}
              featuresJson={m?.featuresJson ?? ""}
              parentId={m?.parentId ?? BigInt(0)}
            />
          );
        })}
      </div>
    </div>
  );
}