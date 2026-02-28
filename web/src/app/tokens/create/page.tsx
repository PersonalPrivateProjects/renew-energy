// src/app/tokens/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { green1155Abi } from "../../../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../../../contracts";
import { Role, UserStatus } from "../../../lib/enums";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { FeaturesJsonForm, featuresJsonToString, FeaturesJsonData } from "../../../components/FeaturesJsonForm";

export default function TokenCreatePage() {
  const { isConnected } = useAccount();
  const { role, status } = useUserStatus();
  const { writeContractAsync, isPending, isSuccess, error } = useWriteContract();

  const [amount, setAmount] = useState<number>(0);
  const [tokenUri, setTokenUri] = useState<string>("");
  const [featuresData, setFeaturesData] = useState<FeaturesJsonData>({
    source: "solar",
    unit: "kWh",
    name: "",
    description: "",
  });
  const [txHash, setTxHash] = useState<string>("");

  const canCreate =
    isConnected && status === UserStatus.Approved && role === Role.PRODUCER;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    if (!amount || amount <= 0) return alert("Amount debe ser > 0");
    if (!featuresData.source) return alert("Debe seleccionar una fuente de energía");
    if (!featuresData.name.trim()) return alert("El nombre es requerido");

    const features = featuresJsonToString(featuresData);

    const hash = await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "mintRaw",
      args: [BigInt(amount), tokenUri.trim(), features]
    });
    setTxHash(String(hash));
  };

  useEffect(() => {
    if (isSuccess) {
      setAmount(0);
      setTokenUri("");
      setFeaturesData({
        source: "solar",
        unit: "kWh",
        name: "",
        description: "",
      });
    }
  }, [isSuccess]);

  if (!canCreate) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">Crear materia prima</h2>
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-600">
          Solo usuarios <b className="text-emerald-600">Producer</b> aprobados pueden crear tokens raíz.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">Crear materia prima</h2>
      <form onSubmit={onSubmit} className="space-y-5 p-5 bg-white border border-slate-200 rounded-xl shadow-sm max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad (amount)</label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Token URI (IPFS/HTTP) — opcional</label>
          <input
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            placeholder="ipfs://... o https://..."
            value={tokenUri}
            onChange={(e) => setTokenUri(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Features</label>
          <FeaturesJsonForm
            mode="create"
            value={featuresData}
            onChange={setFeaturesData}
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
          className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          disabled={isPending}
        >
          {isPending ? "Enviando…" : "Crear token"}
        </button>
      </form>
    </div>
  );
}