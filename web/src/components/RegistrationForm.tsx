"use client";

import { useAccount, useWriteContract } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { green1155Abi } from "../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../contracts";
import { Role, roleOptions, statusLabel, UserStatus } from "../lib/enums";
import { useUserStatus } from "../hooks/useUserStatus";

// Formulario de registro:
// - On-chain: solo envía Role → register(Role).
// - Off-chain: alias opcional (se guarda en localStorage por address).
// - Tras el registro, se refresca el estado para que el gating muestre "Pending".

export default function RegistrationForm() {
  const { address, isConnected } = useAccount();
  const { status, isLoading, refetch } = useUserStatus();
  const { writeContractAsync, isPending: isWriting, error: writeError } = useWriteContract();

  const [selectedRole, setSelectedRole] = useState<Role>(Role.PRODUCER);
  const [alias, setAlias] = useState("");

  // Cargar alias guardado localmente por address
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

    // Guarda alias off-chain (no se envía al contrato)
    saveAlias(alias.trim());

    // Llamada on-chain: register(Role)
    await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "register",
      args: [selectedRole]
    });

    // Espera breve y refresca estado (para ver "Pending")
    setTimeout(() => refetch(), 800);
  };

  if (!isConnected) {
    return <div className="p-4 border border-slate-200 rounded-xl bg-white text-slate-600">Conéctate con MetaMask para registrarte.</div>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 p-5 bg-white border border-slate-200 rounded-xl shadow-sm max-w-md">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado actual</label>
        <div className="text-slate-800 font-medium">{isLoading ? "Cargando…" : statusLabel(status)}</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Rol a solicitar</label>
        <select
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 appearance-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          value={selectedRole}
          onChange={(e) => setSelectedRole(Number(e.target.value) as Role)}
          disabled={!canRegister || isWriting}
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-2">
          Flujo: Producer → Factory → Retailer → Consumer (validaciones del contrato).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Alias (opcional, solo visible en este navegador)
        </label>
        <input
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
          placeholder="Ej: Planta Solar Los Andes"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
      </div>

      {writeError && <p className="text-sm text-red-600">{writeError.message}</p>}

      <button
        type="submit"
        className="w-full px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        disabled={!canRegister || isWriting}
      >
        {isWriting ? "Enviando…" : "Solicitar registro"}
      </button>
    </form>
  );
}