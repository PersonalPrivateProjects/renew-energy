"use client";

import { useAccount } from "wagmi";
import { TransferEvent } from "../hooks/useTransfers";
import { transferStatusLabel, roleLabel } from "../lib/enums";
import { useAcceptTransfer, useRejectTransfer, useCancelTransfer } from "../hooks/useTransfers";
import { useUserStatus } from "../hooks/useUserStatus";
import { useState } from "react";

interface TransferRowProps {
  transfer: TransferEvent;
  onRefresh?: () => void;
}

export function TransferRow({ transfer, onRefresh }: TransferRowProps) {
  const { address } = useAccount();
  const { role } = useUserStatus(transfer.from);
  const { accept, isPending: isAccepting } = useAcceptTransfer();
  const { reject, isPending: isRejecting } = useRejectTransfer();
  const { cancel, isPending: isCanceling } = useCancelTransfer();
  const [actioned, setActioned] = useState(false);

  const isReceiver = address === transfer.to;
  const isSender = address === transfer.from;
  const isPending = transfer.status === 1;

  const handleAccept = () => {
    accept(transfer.transferId);
    setActioned(true);
    setTimeout(() => onRefresh?.(), 2000);
  };

  const handleReject = () => {
    reject(transfer.transferId);
    setActioned(true);
    setTimeout(() => onRefresh?.(), 2000);
  };

  const handleCancel = () => {
    cancel(transfer.transferId);
    setActioned(true);
    setTimeout(() => onRefresh?.(), 2000);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return "bg-amber-100 text-amber-800";
      case 2: return "bg-emerald-100 text-emerald-800";
      case 3: return "bg-red-100 text-red-800";
      case 4: return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };
  const statusColor = getStatusColor(transfer.status);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-2">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800">Transfer #{transfer.transferId.toString()}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
              {transferStatusLabel(transfer.status)}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            <div>De: <span className="font-mono text-xs text-slate-700">{transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}</span> <span className="text-emerald-600">({roleLabel(role)})</span></div>
            <div>Para: <span className="font-mono text-xs text-slate-700">{transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}</span></div>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-medium">Token ID:</span> {transfer.tokenId.toString()} | 
            <span className="font-medium ml-2">Cantidad:</span> {transfer.amount.toString()}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isPending && isReceiver && !actioned && (
            <>
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isAccepting ? "Aceptando..." : "Aceptar"}
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isRejecting ? "Rechazando..." : "Rechazar"}
              </button>
            </>
          )}
          {isPending && isSender && !actioned && (
            <button
              onClick={handleCancel}
              disabled={isCanceling}
              className="px-3 py-1.5 bg-slate-500 text-white text-sm rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              {isCanceling ? "Cancelando..." : "Cancelar"}
            </button>
          )}
          {actioned && (
            <span className="text-sm text-slate-400">Procesando...</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface TransferListProps {
  transfers: TransferEvent[];
  loading?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
}

export function TransferList({ transfers, loading, emptyMessage = "No hay transferencias", onRefresh }: TransferListProps) {
  if (loading) {
    return <div className="text-center py-8 text-slate-500">Cargando transferencias...</div>;
  }

  if (transfers.length === 0) {
    return <div className="text-center py-8 text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-2">
      {transfers.map((transfer) => (
        <TransferRow key={transfer.transferId.toString()} transfer={transfer} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
