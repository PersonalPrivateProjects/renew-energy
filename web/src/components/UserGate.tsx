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
// (Esta lógica cubre la sección de "Paginas principales" del documento.) [1](https://idata2-my.sharepoint.com/personal/carlos_abreu_idata_global/Documents/Microsoft%20Copilot%20Chat%20Files/prompts.txt)

export default function UserGate() {
  const { isConnected } = useAccount();
  const { status, isLoading } = useUserStatus();

  if (!isConnected) {
    return (
      <div className="p-4 border rounded bg-white">
        <p className="mb-2">No estás conectado.</p>
        <p className="text-sm text-gray-600">Usa el botón “Conectar MetaMask” en la esquina superior.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 border rounded bg-white">Cargando estado…</div>;
  }

  if (status === UserStatus.None || status === UserStatus.Rejected || status === UserStatus.Canceled) {
    return (
      <div className="p-4 border rounded bg-white">
        <p className="mb-1">Estado: <b>{statusLabel(status)}</b></p>
        <p className="text-sm text-gray-600 mb-3">Puedes solicitar registro por rol.</p>
        <Link href="/(auth)/register" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded">
          Ir a Registro
        </Link>
      </div>
    );
  }

  if (status === UserStatus.Pending) {
    return (
      <div className="p-4 border rounded bg-white">
        <p className="mb-1">Estado: <b>Pendiente</b></p>
        <p className="text-sm text-gray-600">Esperando aprobación del administrador…</p>
      </div>
    );
  }

  // Approved
  return (
    <div className="p-4 border rounded bg-white">
      <p className="mb-2">¡Estás aprobado! 🎉</p>
      <Link href="/dashboard" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded">
        Ir al Dashboard
      </Link>
    </div>
  );
}
