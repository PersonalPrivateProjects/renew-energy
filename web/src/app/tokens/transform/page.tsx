// src/app/tokens/transform/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { green1155Abi } from "../../../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../../../contracts";
import { Role, UserStatus } from "../../../lib/enums";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { fetchUserBalancesAll, fetchTokenMetadataBatch } from "../../../lib/token";
import { FeaturesJsonForm, featuresJsonToString, FeaturesJsonData, parseFeaturesJson } from "../../../components/FeaturesJsonForm";

function FactoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}

export default function TokenTransformPage() {
  const { address, isConnected } = useAccount();
  const { role, status } = useUserStatus();
  const { writeContractAsync, isPending, isSuccess, error } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<{ id: bigint; balance: bigint }[]>([]);
  const [meta, setMeta] = useState<Record<string, { uri: string; featuresJson: string; parentId: bigint }>>({});
  const [parentId, setParentId] = useState<bigint | null>(null);
  const [parentFeatures, setParentFeatures] = useState<FeaturesJsonData | null>(null);
  const [featuresData, setFeaturesData] = useState<FeaturesJsonData>({
    source: "",
    unit: "kWh",
    name: "",
    description: "",
    certification: "",
  });
  const [amount, setAmount] = useState<number>(0);
  const [childUri, setChildUri] = useState<string>("");
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

  const handleParentChange = (newParentId: bigint | null) => {
    setParentId(newParentId);
    if (newParentId) {
      const parentMeta = meta[newParentId.toString()];
      if (parentMeta?.featuresJson) {
        const parsed = parseFeaturesJson(parentMeta.featuresJson);
        if (parsed) {
          setParentFeatures(parsed);
          setFeaturesData({
            source: parsed.source,
            unit: parsed.unit,
            name: "",
            description: "",
            certification: parsed.certification,
          });
          return;
        }
      }
    }
    setParentFeatures(null);
    setFeaturesData({
      source: "",
      unit: "kWh",
      name: "",
      description: "",
      certification: "",
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setParentId(null);
      setParentFeatures(null);
      setAmount(0);
      setChildUri("");
      setFeaturesData({
        source: "",
        unit: "kWh",
        name: "",
        description: "",
        certification: "",
      });
      setTimeout(() => loadInventory(), 2500);
    }
  }, [isSuccess, loadInventory]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canTransform || !parentId) return;
    if (!amount || amount <= 0) return alert("Amount debe ser > 0");
    if (!featuresData.source) return alert("Debe seleccionar una fuente de energía");
    if (!featuresData.name.trim()) return alert("El nombre es requerido");

    const features = featuresJsonToString(featuresData);

    const hash = await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "transform",
      args: [parentId, BigInt(amount), childUri.trim(), features]
    });
    setTxHash(String(hash));
  };

  if (!canTransform) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <FactoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Transformar Energía</h2>
            <p className="text-sm text-gray-500">Convertir materia prima en certificados</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Acceso restringido</p>
              <p className="text-sm mt-1">Solo usuarios <b className="text-blue-600">Factory</b> aprobados pueden transformar tokens de energía.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <FactoryIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Transformar Energía</h2>
          <p className="text-sm text-gray-500">Convertir materia prima en certificados energéticos</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Selecciona un <b className="text-gray-800">token padre</b> de tu inventario (balance &gt; 0). 
          Estos representan la materia prima recibida desde Producer. Transforma la energía en certificados 
          listos para distribución.
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
            No tienes tokens para transformar aún. Cuando implementemos Transfers,
            podrás recibir de Producer y verlos aquí.
          </div>
        )}

        {!loading && inventory.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Seleccionar materia prima</label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              value={parentId ? parentId.toString() : ""}
              onChange={(e) => handleParentChange(e.target.value ? BigInt(e.target.value) : null)}
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad a transformar</label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            placeholder="Ej: 500"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Child URI
            <span className="ml-1 text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            placeholder="ipfs://... o https://..."
            value={childUri}
            onChange={(e) => setChildUri(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Características del certificado</label>
          {parentFeatures ? (
            <FeaturesJsonForm
              mode="transform"
              parentFeatures={parentFeatures}
              value={featuresData}
              onChange={setFeaturesData}
            />
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
              Selecciona un token padre para ver sus características
            </div>
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
          className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center gap-2"
          disabled={isPending || !parentId}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Transformando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FactoryIcon className="w-4 h-4" />
              Transformar energía
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
