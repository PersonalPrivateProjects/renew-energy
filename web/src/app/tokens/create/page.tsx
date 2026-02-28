// src/app/tokens/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { green1155Abi } from "../../../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../../../contracts";
import { Role, UserStatus } from "../../../lib/enums";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { FeaturesJsonForm, featuresJsonToString, FeaturesJsonData } from "../../../components/FeaturesJsonForm";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

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
    certification: "",
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
        certification: "",
      });
    }
  }, [isSuccess]);

  if (!canCreate) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
            <SunIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Crear Materia Prima</h2>
            <p className="text-sm text-gray-500">Generar tokens de energía renovable</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Acceso restringido</p>
              <p className="text-sm mt-1">Solo usuarios <b className="text-emerald-600">Producer</b> aprobados pueden crear tokens de energía raíz.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
          <SunIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Crear Materia Prima</h2>
          <p className="text-sm text-gray-500">Generar nuevos tokens de energía renovable</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <p className="text-sm text-gray-600 mb-6">
          Crea tokens de materia prima energética. Estos representarán la energía generada 
          por fuentes renovables (solar, eólica, hidráulica, etc.) antes de ser transformada.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad de energía (kWh)</label>
            <input
              type="number"
              min={1}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              placeholder="Ej: 1000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Token URI (IPFS/HTTP) 
              <span className="ml-1 text-gray-400 font-normal">— opcional</span>
            </label>
            <input
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              placeholder="ipfs://... o https://..."
              value={tokenUri}
              onChange={(e) => setTokenUri(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Características de la energía</label>
            <FeaturesJsonForm
              mode="create"
              value={featuresData}
              onChange={setFeaturesData}
            />
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
            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando transacción...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <SunIcon className="w-4 h-4" />
                Crear token de energía
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
