"use client";

import { useAccount } from "wagmi";
import { TransferEvent } from "../hooks/useTransfers";
import { transferStatusLabel, roleLabel } from "../lib/enums";
import { useAcceptTransfer, useRejectTransfer, useCancelTransfer } from "../hooks/useTransfers";
import { useUserStatus } from "../hooks/useUserStatus";
import { useState, useEffect } from "react";

interface TransferRowProps {
  transfer: TransferEvent;
  onRefresh?: () => void;
}

function ArrowRightIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;
}

function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
}

function XMarkIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}

export function TransferRow({ transfer, onRefresh }: TransferRowProps) {
  const { address } = useAccount();
  const { role } = useUserStatus(transfer.from);
  const { accept, isPending: isAccepting, isSuccess: isAcceptSuccess } = useAcceptTransfer();
  const { reject, isPending: isRejecting, isSuccess: isRejectSuccess } = useRejectTransfer();
  const { cancel, isPending: isCanceling, isSuccess: isCancelSuccess } = useCancelTransfer();
  const [actioned, setActioned] = useState(false);

  const isReceiver = address === transfer.to;
  const isSender = address === transfer.from;
  const isPending = transfer.status === 1;

  useEffect(() => {
    if ((isAcceptSuccess || isRejectSuccess || isCancelSuccess) && onRefresh) {
      setTimeout(() => onRefresh(), 1500);
    }
  }, [isAcceptSuccess, isRejectSuccess, isCancelSuccess, onRefresh]);

  const handleAccept = () => {
    setActioned(true);
    accept(transfer.transferId);
  };

  const handleReject = () => {
    setActioned(true);
    reject(transfer.transferId);
  };

  const handleCancel = () => {
    setActioned(true);
    cancel(transfer.transferId);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return "bg-amber-100 text-amber-700 border-amber-200";
      case 2: return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 3: return "bg-red-100 text-red-700 border-red-200";
      case 4: return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };
  const statusColor = getStatusColor(transfer.status);

  return (
    <div className="glass-card rounded-xl p-4 mb-3">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800">Transfer #{transfer.transferId.toString()}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
              {transferStatusLabel(transfer.status)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-500">De:</span>
              <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}</span>
              <span className="text-emerald-600 text-xs">({roleLabel(role)})</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-500">Para:</span>
              <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              <span className="font-medium">Token:</span> #{transfer.tokenId.toString()}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              <span className="font-medium">Cantidad:</span> {transfer.amount.toString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 sm:flex-shrink-0">
          {isPending && isReceiver && !actioned && (
            <>
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isAccepting ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <CheckIcon className="w-3.5 h-3.5" />
                )}
                Aceptar
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isRejecting ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <XMarkIcon className="w-3.5 h-3.5" />
                )}
                Rechazar
              </button>
            </>
          )}
          {isPending && isSender && !actioned && (
            <button
              onClick={handleCancel}
              disabled={isCanceling}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              {isCanceling ? (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <XMarkIcon className="w-3.5 h-3.5" />
              )}
              Cancelar
            </button>
          )}
          {actioned && (
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </span>
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
    return (
      <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Cargando transferencias...
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </div>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {transfers.map((transfer) => (
        <TransferRow key={transfer.transferId.toString()} transfer={transfer} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
