"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useTransfersInbox, useTransfersOutbox, useTransfersHistory } from "../../hooks/useTransfers";
import { TransferList } from "../../components/TransferList";
import { useUserStatus } from "../../hooks/useUserStatus";
import Link from "next/link";
import { UserStatus } from "../../lib/enums";

type Tab = "inbox" | "outbox" | "history";

export default function TransfersPage() {
  const { isConnected } = useAccount();
  const { status } = useUserStatus();

  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  const inboxQ = useTransfersInbox();
  const outboxQ = useTransfersOutbox();
  const historyQ = useTransfersHistory();

  const handleRefresh = async () => {
    // ✅ Refresca todas las bandejas (o al menos la activa + la contraria)
    await Promise.all([inboxQ.refetch(), outboxQ.refetch(), historyQ.refetch()]);
  };

  const tabs = [
    { id: "inbox" as const, label: "Pendientes (Recibir)", count: inboxQ.transfers.length, loading: inboxQ.loading },
    { id: "outbox" as const, label: "Enviadas", count: outboxQ.transfers.length, loading: outboxQ.loading },
    { id: "history" as const, label: "Historial", count: historyQ.transfers.length, loading: historyQ.loading },
  ];

  const currentQ = activeTab === "inbox" ? inboxQ : activeTab === "outbox" ? outboxQ : historyQ;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Transferencias</h1>
          <p className="text-gray-600">Conecta tu wallet para ver tus transferencias</p>
        </div>
      </div>
    );
  }

  if (status !== UserStatus.Approved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Transferencias</h1>
          <p className="text-gray-600">Debes estar aprobado para acceder a las transferencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transferencias</h1>
          <Link href="/tokens" className="text-blue-600 hover:underline text-sm">
            Ir a Mis Tokens
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.loading ? (
                  <span className="ml-2 text-xs">(...)</span>
                ) : (
                  <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4">
            <TransferList
              key={activeTab}
              transfers={currentQ.transfers}
              loading={currentQ.loading}
              onRefresh={handleRefresh} // ✅ refresca tras acciones
              emptyMessage={
                activeTab === "inbox"
                  ? "No hay transferencias pendientes por recibir"
                  : activeTab === "outbox"
                  ? "No hay transferencias enviadas pendientes"
                  : "No hay historial de transferencias"
              }
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <h3 className="font-medium mb-2">¿Cómo funciona?</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Pendientes:</strong> Transferencias que has recibido y debes aceptar o rechazar</li>
            <li><strong>Enviadas:</strong> Transferencias que has iniciado y están pendientes de aceptación</li>
            <li><strong>Historial:</strong> Todas tus transferencias (enviadas y recibidas)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}