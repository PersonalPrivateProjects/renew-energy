"use client";

import Link from "next/link";
import ConnectButton from "./ConnectButton";
import { useAccount } from "wagmi";
import { useIsAdmin } from "../hooks/useIsAdmin";

// Barra superior con navegación simple.
export default function NavBar() {
  const { isConnected } = useAccount();
  const { isAdmin } = useIsAdmin();

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-emerald-600 hover:text-emerald-700">Green Supply Chain</Link>
          {isConnected && (
            <>
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Dashboard</Link>
              <Link href="/profile" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Profile</Link>
              {!isAdmin && (
                <>
                  <Link href="/tokens" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Tokens</Link>
                  <Link href="/transfers" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Transfers</Link>
                </>
              )}
               {isAdmin && <Link href="/admin/users" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Admin</Link>}
            </>
          )}
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}