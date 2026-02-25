"use client";

import { useAccount } from "wagmi";
import { shortAddress } from "../../lib/utils";
import { useEffect, useState } from "react";
import { useUserStatus } from "../../hooks/useUserStatus";
import { statusLabel } from "../../lib/enums";

// Perfil simple: muestra address, estado on-chain y permite editar alias off-chain.
// No escribe nada al contrato (evitamos PII pública). Esta práctica está alineada con
// mantener el on-chain mínimo que pide la tarea y dejar UX adicional off-chain. [1](https://idata2-my.sharepoint.com/personal/carlos_abreu_idata_global/Documents/Microsoft%20Copilot%20Chat%20Files/prompts.txt)

export default function ProfilePage() {
  const { address } = useAccount();
  const { status } = useUserStatus();
  const [alias, setAlias] = useState("");

  useEffect(() => {
    if (!address) return;
    const key = `alias:${address.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    if (saved) setAlias(saved);
  }, [address]);

  const saveAlias = () => {
    if (!address) return;
    localStorage.setItem(`alias:${address.toLowerCase()}`, alias.trim());
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Perfil</h2>
      <div className="p-4 border rounded bg-white space-y-4">
        <p><b>Address:</b> {address ? shortAddress(address) : "—"}</p>
        <p><b>Estado:</b> {statusLabel(status)}</p>

        <div>
          <label className="block text-sm font-medium">Alias local (opcional)</label>
          <input
            className="mt-1 w-full border rounded p-2"
            value={alias}
            placeholder="Mi Empresa / Mi Nombre"
            onChange={(e) => setAlias(e.target.value)}
          />
          <button
            onClick={saveAlias}
            className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Guardar alias
          </button>
        </div>
      </div>
    </div>
  );
}