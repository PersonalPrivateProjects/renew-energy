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
    return <div className="p-4 border rounded">Conéctate con MetaMask para registrarte.</div>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 border rounded bg-white max-w-md">
      <div>
        <label className="block text-sm font-medium">Estado actual</label>
        <div className="mt-1 text-gray-700">{isLoading ? "Cargando…" : statusLabel(status)}</div>
      </div>

      <div>
        <label className="block text-sm font-medium">Rol a solicitar</label>
        <select
          className="mt-1 w-full border rounded p-2"
          value={selectedRole}
          onChange={(e) => setSelectedRole(Number(e.target.value) as Role)}
          disabled={!canRegister || isWriting}
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Flujo: Producer → Factory → Retailer → Consumer (validaciones del contrato).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Alias (opcional, solo visible en este navegador)
        </label>
        <input
          className="mt-1 w-full border rounded p-2"
          placeholder="Ej: Planta Solar Los Andes"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
      </div>

      {writeError && <p className="text-sm text-red-600">{writeError.message}</p>}

      <button
        type="submit"
        className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!canRegister || isWriting}
      >
        {isWriting ? "Enviando…" : "Solicitar registro"}
      </button>
    </form>
  );
}