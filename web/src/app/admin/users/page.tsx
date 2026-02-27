"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useIsAdmin } from "../../../hooks/useIsAdmin";
import { useAdminUsers } from "../../../hooks/useAdminUsers";
import AdminUserRow from "../../../components/AdminUserRow";

export default function AdminUsersPage() {
  const { address, isConnected } = useAccount();
  const { isAdmin, isLoading: loadingAdmin } = useIsAdmin();

  // pequeño refresco tras acciones: volver a ejecutar el hook
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { users, pending, loading, error } = useAdminUsers(refreshFlag); // 👈 ahora el hook depende de refreshFlag

  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const list = showPendingOnly ? pending : users;

  useEffect(() => { /* opcional: puedes eliminar este efecto */ }, [refreshFlag]);

  if (!isConnected) {
    return <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-600">Conéctate con MetaMask.</div>;
  }

  if (loadingAdmin) {
    return <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-600">Verificando permisos de administrador…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-5 bg-white border border-slate-200 rounded-xl">
        <p className="font-semibold text-slate-800">Acceso denegado</p>
        <p className="text-sm text-slate-500 mt-1">Tu cuenta ({address}) no tiene permisos de administrador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Administración de Usuarios</h2>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showPendingOnly}
            onChange={() => setShowPendingOnly((v) => !v)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          Mostrar sólo pendientes
        </label>
      </header>

      {loading && <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-600">Cargando usuarios desde eventos…</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">Error: {String((error as any).message || error)}</div>}

      {!loading && list.length === 0 && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-500">No hay usuarios para mostrar.</div>
      )}

      <div className="space-y-3">
        {list.map((u) => (
          <AdminUserRow
            key={u.address}
            user={u}
            onChanged={() => setRefreshFlag((n) => n + 1)} // ✅ fuerza refetch del hook
          />
        ))}
      </div>
    </div>
  );
}