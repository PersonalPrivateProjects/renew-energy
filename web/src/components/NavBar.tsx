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
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">Green Supply Chain</Link>
          {isConnected && (
            <>
              <Link href="/dashboard" className="text-sm text-gray-700 hover:text-black">Dashboard</Link>
              <Link href="/profile" className="text-sm text-gray-700 hover:text-black">Profile</Link>
              <Link href="/tokens" className="text-sm text-gray-700 hover:text-black">Tokens</Link>
              <Link href="/transfers" className="text-sm text-gray-700 hover:text-black">Transfers</Link>
               {isAdmin && <Link href="/admin/users">Admin</Link>}
              {/* Próximos pasos:             
              <Link href="/admin/users" className="text-sm text-gray-700 hover:text-black">Admin</Link>
              */}
            </>
          )}
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}