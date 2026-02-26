"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { getValidRecipients, roleLabel } from "../lib/enums";
import { useUserStatus } from "../hooks/useUserStatus";
import { useInitiateTransfer, useApprovedUsersByRole } from "../hooks/useTransfers";

interface StartTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: bigint;
  tokenBalance: bigint;
  onSuccess?: () => void;
}

export function StartTransferDialog({ isOpen, onClose, tokenId, tokenBalance, onSuccess }: StartTransferDialogProps) {
  const { address } = useAccount();
  const { role, status } = useUserStatus();
  const { initiate, isPending, isSuccess, hash } = useInitiateTransfer();
  
  const validRecipientRoles = getValidRecipients(role);
  
  const role0Users = useApprovedUsersByRole(validRecipientRoles[0]);
  const role1Users = useApprovedUsersByRole(validRecipientRoles[1]);
  
  const approvedAddresses = useMemo(() => {
    const addrs: `0x${string}`[] = [];
    if (validRecipientRoles[0]) addrs.push(...role0Users.users);
    if (validRecipientRoles[1]) addrs.push(...role1Users.users);
    return addrs;
  }, [validRecipientRoles, role0Users.users, role1Users.users]);
  
  const [selectedRecipient, setSelectedRecipient] = useState<`0x${string}` | "">("");
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSelectedRecipient("");
        setAmount("");
        setError("");
      }, 1500);
    }
  }, [isSuccess, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address || status !== 2) {
      setError("No tienes permisos para transferir");
      return;
    }

    if (!selectedRecipient) {
      setError("Selecciona un destinatario");
      return;
    }

    const transferAmount = BigInt(amount);
    if (transferAmount <= BigInt(0)) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (transferAmount > tokenBalance) {
      setError("No tienes suficiente balance");
      return;
    }

    initiate(selectedRecipient, tokenId, transferAmount);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Iniciar Transferencia</h2>
        
        <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm border border-slate-200">
          <div className="text-slate-600"><span className="font-medium">Token ID:</span> <span className="text-slate-800">{tokenId.toString()}</span></div>
          <div className="text-slate-600"><span className="font-medium">Tu balance:</span> <span className="text-slate-800">{tokenBalance.toString()}</span></div>
          <div className="text-slate-600"><span className="font-medium">Tu rol:</span> <span className="text-emerald-600">{roleLabel(role)}</span></div>
        </div>

        {validRecipientRoles.length === 0 ? (
          <div className="text-red-600 mb-4 text-sm">
            Tu rol no puede iniciar transferencias. Solo Producer, Factory y Retailer pueden hacerlo.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Destinatario ( {validRecipientRoles.map(r => roleLabel(r)).join(" o ")} )
              </label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value as `0x${string}`)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                required
              >
                <option value="">Seleccionar...</option>
                {approvedAddresses.map((addr) => (
                  <option key={addr} value={addr}>
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                  </option>
                ))}
              </select>
              {approvedAddresses.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  {role0Users.loading || role1Users.loading 
                    ? "Cargando usuarios..." 
                    : "No hay usuarios aprobados del rol necesario"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad</label>
              <input
                type="number"
                min="1"
                max={tokenBalance.toString()}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
                placeholder={`Max: ${tokenBalance.toString()}`}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm p-2 bg-red-50 rounded-lg border border-red-200">{error}</div>
            )}

            {isSuccess && (
              <div className="text-emerald-600 text-sm p-2 bg-emerald-50 rounded-lg border border-emerald-200 font-medium">
                Transferencia iniciada exitosamente. Hash: {hash?.slice(0, 10)}...
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || approvedAddresses.length === 0}
                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isPending ? "Iniciando..." : "Transferir"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
