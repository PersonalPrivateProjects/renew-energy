"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { statusLabel, UserStatus } from "../lib/enums";
import { useUserStatus } from "../hooks/useUserStatus";

function UserIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
}

function CheckCircleIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function ClockIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function ExclamationCircleIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>;
}

export default function UserGate() {
  const { isConnected } = useAccount();
  const { status, isLoading } = useUserStatus();

  if (!isConnected) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-gray-400" />
        </div>
        <p className="mb-2 text-gray-700 font-medium">No estás conectado.</p>
        <p className="text-sm text-gray-500">Usa el botón "Conectar Wallet" en la esquina superior.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 text-center text-gray-500">
        <svg className="animate-spin h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Cargando estado…
      </div>
    );
  }

  if (status === UserStatus.None || status === UserStatus.Rejected || status === UserStatus.Canceled) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <ExclamationCircleIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">Estado: <span className="font-semibold">{statusLabel(status)}</span></p>
            <p className="text-sm text-gray-500 mt-1 mb-4">Puedes solicitar registro por rol para acceder al sistema.</p>
            <Link href="/auth/register" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ir a Registro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === UserStatus.Pending) {
    return (
      <div className="glass-card rounded-xl p-6 bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Estado: Pendiente de aprobación</p>
            <p className="text-sm text-amber-700 mt-1">Esperando aprobación del administrador…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 bg-emerald-50 border border-emerald-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircleIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-emerald-800">¡Estás aprobado!</p>
          <p className="text-sm text-emerald-700 mt-1 mb-4">Tienes acceso completo al sistema de trazabilidad energética.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
