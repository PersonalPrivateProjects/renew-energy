"use client";

import { useAccount, useWriteContract } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { green1155Abi } from "../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../contracts";
import { Role, roleOptions, statusLabel, UserStatus } from "../lib/enums";
import { useUserStatus } from "../hooks/useUserStatus";

function ClipboardDocumentListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export default function RegistrationForm() {
  const { address, isConnected } = useAccount();
  const { status, isLoading, refetch } = useUserStatus();
  const { writeContractAsync, isPending: isWriting, error: writeError } = useWriteContract();

  const [selectedRole, setSelectedRole] = useState<Role>(Role.PRODUCER);
  const [alias, setAlias] = useState("");

  useEffect(() => {
    if (!address) return;
    const key = `alias:${address.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    if (saved) setAlias(saved);
  }, [address]);

  const canRegister = useMemo(
    () => isConnected && (status === UserStatus.None || status === UserStatus.Rejected || status === UserStatus.Canceled),
    [isConnected, status]
  );

  const saveAlias = (value: string) => {
    if (!address) return;
    localStorage.setItem(`alias:${address.toLowerCase()}`, value);
    setAlias(value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRegister) return;

    saveAlias(alias.trim());

    await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "register",
      args: [selectedRole]
    });

    setTimeout(() => refetch(), 800);
  };

  if (!isConnected) {
    return (
      <div className="glass-card rounded-xl p-6 text-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <p>Conéctate con MetaMask para registrarte.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card rounded-xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado actual</label>
        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
          isLoading ? 'bg-gray-100 text-gray-600' :
          status === 2 ? 'bg-emerald-100 text-emerald-700' : 
          status === 1 ? 'bg-yellow-100 text-yellow-700' : 
          status === 3 ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {isLoading ? "Cargando…" : statusLabel(status)}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol a solicitar</label>
        <select
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
          value={selectedRole}
          onChange={(e) => setSelectedRole(Number(e.target.value) as Role)}
          disabled={!canRegister || isWriting}
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Flujo: Producer → Factory → Retailer → Consumer
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Alias local
          <span className="ml-1 text-gray-400 font-normal">(solo visible en este navegador)</span>
        </label>
        <input
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
          placeholder="Ej: Planta Solar Los Andes"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
      </div>

      {writeError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {writeError.message}
        </div>
      )}

      <button
        type="submit"
        className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center gap-2"
        disabled={!canRegister || isWriting}
      >
        {isWriting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-4 h-4" />
            Solicitar registro
          </span>
        )}
      </button>
    </form>
  );
}
