"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useTransfersInbox, useTransfersOutbox, useTransfersHistory } from "../../hooks/useTransfers";
import { TransferList } from "../../components/TransferList";
import { useUserStatus } from "../../hooks/useUserStatus";
import Link from "next/link";
import { UserStatus } from "../../lib/enums";

function ChainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

type Tab = "inbox" | "outbox" | "history";

export default function TransfersPage() {
  const { isConnected } = useAccount();
  const { status } = useUserStatus();

  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  const inboxQ = useTransfersInbox();
  const outboxQ = useTransfersOutbox();
  const historyQ = useTransfersHistory();

  const handleRefresh = async () => {
    await Promise.all([inboxQ.refetch(), outboxQ.refetch(), historyQ.refetch()]);
  };

  const tabs = [
    { id: "inbox" as const, label: "Pendientes", count: inboxQ.transfers.length, loading: inboxQ.loading },
    { id: "outbox" as const, label: "Enviadas", count: outboxQ.transfers.length, loading: outboxQ.loading },
    { id: "history" as const, label: "Historial", count: historyQ.transfers.length, loading: historyQ.loading },
  ];

  const currentQ = activeTab === "inbox" ? inboxQ : activeTab === "outbox" ? outboxQ : historyQ;

  if (!isConnected) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ChainIcon className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Transferencias</h2>
          <p className="text-gray-500">Conecta tu wallet para gestionar tus transferencias de energía.</p>
        </div>
      </div>
    );
  }

  if (status !== UserStatus.Approved) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso restringido</h2>
          <p className="text-gray-500">Debes estar aprobado para acceder a las transferencias de energía.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <ChainIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Transferencias</h2>
          <p className="text-sm text-gray-500">Gestiona el flujo de certificados de energía</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab.label}
                {tab.loading ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          <TransferList
            key={activeTab}
            transfers={currentQ.transfers}
            loading={currentQ.loading}
            onRefresh={handleRefresh}
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

      <div className="glass-card rounded-xl p-4 text-sm">
        <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          ¿Cómo funciona?
        </h3>
        <ul className="text-gray-600 space-y-1 ml-6 list-disc">
          <li><strong>Pendientes:</strong> Transferencias que has recibido y debes aceptar o rechazar</li>
          <li><strong>Enviadas:</strong> Transferencias que has iniciado y están pendientes de aceptación</li>
          <li><strong>Historial:</strong> Todas tus transferencias (enviadas y recibidas)</li>
        </ul>
      </div>
    </div>
  );
}
