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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Iniciar Transferencia</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
          <div><strong>Token ID:</strong> {tokenId.toString()}</div>
          <div><strong>Tu balance:</strong> {tokenBalance.toString()}</div>
          <div><strong>Tu rol:</strong> {roleLabel(role)}</div>
        </div>

        {validRecipientRoles.length === 0 ? (
          <div className="text-red-600 mb-4">
            Tu rol no puede iniciar transferencias. Solo Producer, Factory y Retailer pueden hacerlo.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Destinatario ( {validRecipientRoles.map(r => roleLabel(r)).join(" o ")} )
              </label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value as `0x${string}`)}
                className="w-full border rounded px-3 py-2"
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
                <p className="text-xs text-gray-500 mt-1">
                  {role0Users.loading || role1Users.loading 
                    ? "Cargando usuarios..." 
                    : "No hay usuarios aprobados del rol necesario"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                max={tokenBalance.toString()}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder={`Max: ${tokenBalance.toString()}`}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {isSuccess && (
              <div className="text-green-600 text-sm">
                Transferencia iniciada exitosamente. Hash: {hash?.slice(0, 10)}...
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || approvedAddresses.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
