"use client";

import { useAccount } from "wagmi";
import { shortAddress } from "../../lib/utils";
import { useEffect, useState } from "react";
import { useUserStatus } from "../../hooks/useUserStatus";
import { statusLabel } from "../../lib/enums";

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

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
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
          <UserIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Perfil</h2>
          <p className="text-sm text-gray-500">Gestiona tu información</p>
        </div>
      </div>
      
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-500">Wallet</span>
          <span className="text-gray-800 font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg">{address ? shortAddress(address) : "—"}</span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-500">Estado</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            status === 2 ? 'bg-emerald-100 text-emerald-700' : 
            status === 1 ? 'bg-yellow-100 text-yellow-700' : 
            'bg-gray-100 text-gray-600'
          }`}>
            {statusLabel(status)}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Alias local 
            <span className="ml-1 text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            value={alias}
            placeholder="Mi Empresa / Mi Nombre"
            onChange={(e) => setAlias(e.target.value)}
          />
          <button
            onClick={saveAlias}
            className="mt-3 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md text-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
