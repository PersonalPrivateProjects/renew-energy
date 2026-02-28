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

function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
}

function ArrowPathIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
}

function FireIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>;
}

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
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <p className="text-gray-600">Conéctate con tu wallet para ver tus tokens de energía.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {canMint && (
          <Link
            href="/tokens/create"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md"
          >
            <PlusIcon className="w-4 h-4" />
            Crear materia prima
          </Link>
        )}
        {canTransform && (
          <Link
            href="/tokens/transform"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Transformar
          </Link>
        )}
        {canRedeem && (
          <Link
            href="/tokens/redeem"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          >
            <FireIcon className="w-4 h-4" />
            Redimir
          </Link>
        )}
      </div>

      {loading && (
        <div className="glass-card rounded-xl p-6 text-center">
          <svg className="animate-spin h-6 w-6 mx-auto text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500 mt-2">Cargando tus tokens de energía…</p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </div>
          <p className="font-medium text-gray-700">No tienes tokens aún.</p>
          <p className="text-sm text-gray-500 mt-1">
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
