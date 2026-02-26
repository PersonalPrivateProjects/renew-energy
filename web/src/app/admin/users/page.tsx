"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useIsAdmin } from "../../../hooks/useIsAdmin";
import { useAdminUsers } from "../../../hooks/useAdminUsers";
import AdminUserRow from "../../../components/AdminUserRow";

export default function AdminUsersPage() {
  const { address, isConnected } = useAccount();
  const { isAdmin, isLoading: loadingAdmin } = useIsAdmin();
  const { users, pending, loading, error } = useAdminUsers();

  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const list = showPendingOnly ? pending : users;

  // pequeño refresco tras acciones: volver a ejecutar el hook
  const [refreshFlag, setRefreshFlag] = useState(0);
  useEffect(() => { /* noop: el hook vuelve a correr en cada montaje */ }, [refreshFlag]);

  if (!isConnected) {
    return <div className="p-4 border rounded bg-white">Conéctate con MetaMask.</div>;
  }

  if (loadingAdmin) {
    return <div className="p-4 border rounded bg-white">Verificando permisos de administrador…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-4 border rounded bg-white">
        <p className="font-semibold">Acceso denegado</p>
        <p className="text-sm text-gray-600">Tu cuenta ({address}) no tiene permisos de administrador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Administración de Usuarios</h2>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPendingOnly}
            onChange={() => setShowPendingOnly((v) => !v)}
          />
          Mostrar sólo pendientes
        </label>
      </header>

      {loading && <div className="p-4 border rounded bg-white">Cargando usuarios desde eventos…</div>}
      {error && <div className="p-4 border rounded bg-white text-red-600">Error: {String(error.message || error)}</div>}

      {!loading && list.length === 0 && (
        <div className="p-4 border rounded bg-white">No hay usuarios para mostrar.</div>
      )}

      <div className="space-y-3">
        {list.map((u) => (
          <AdminUserRow
            key={u.address}
            user={u}
            onChanged={() => setRefreshFlag((n) => n + 1)}
          />
        ))}
      </div>
    </div>
  );
}