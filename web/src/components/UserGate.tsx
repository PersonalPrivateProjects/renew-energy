"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { statusLabel, UserStatus } from "../lib/enums";
import { useUserStatus } from "../hooks/useUserStatus";

// Componente que "guía" al usuario según su estado (requerimiento del enunciado):
// - No conectado: invita a conectar.
// - Conectado y no registrado: invita a registrarse.
// - Conectado y Pending: muestra espera de aprobación.
// - Conectado y Approved: muestra acceso al dashboard.
// - Rechazado/Cancelado: muestra estado y permite volver a intentar registro.

export default function UserGate() {
  const { isConnected } = useAccount();
  const { status, isLoading } = useUserStatus();

  if (!isConnected) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-center">
        <p className="mb-2 text-slate-700">No estás conectado.</p>
        <p className="text-sm text-slate-500">Usa el botón "Conectar MetaMask" en la esquina superior.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-slate-500">Cargando estado…</div>;
  }

  if (status === UserStatus.None || status === UserStatus.Rejected || status === UserStatus.Canceled) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <p className="mb-1 text-slate-700">Estado: <span className="font-medium">{statusLabel(status)}</span></p>
        <p className="text-sm text-slate-500 mb-4">Puedes solicitar registro por rol.</p>
        <Link href="/auth/register" className="inline-block px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200">
          Ir a Registro
        </Link>
      </div>
    );
  }

  if (status === UserStatus.Pending) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <p className="mb-1 text-slate-700 font-medium">Estado: Pendiente</p>
        <p className="text-sm text-amber-700">Esperando aprobación del administrador…</p>
      </div>
    );
  }

  // Approved
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
      <p className="mb-3 text-emerald-700 font-medium">¡Estás aprobado!</p>
      <Link href="/dashboard" className="inline-block px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200">
        Ir al Dashboard
      </Link>
    </div>
  );
}
