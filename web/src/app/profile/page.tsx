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
      <h2 className="text-xl font-semibold text-slate-800">Perfil</h2>
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-5">
        <div className="flex items-center justify-between py-2 border-b border-slate-200">
          <span className="text-sm font-medium text-slate-500">Address</span>
          <span className="text-slate-800 font-mono text-sm">{address ? shortAddress(address) : "—"}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-slate-200">
          <span className="text-sm font-medium text-slate-500">Estado</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{statusLabel(status)}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Alias local (opcional)</label>
          <input
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            value={alias}
            placeholder="Mi Empresa / Mi Nombre"
            onChange={(e) => setAlias(e.target.value)}
          />
          <button
            onClick={saveAlias}
            className="mt-3 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Guardar alias
          </button>
        </div>
      </div>
    </div>
  );
}