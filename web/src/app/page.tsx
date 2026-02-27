"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import UserGate from "../components/UserGate";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  
 

  useEffect(() => {
     console.log("Usuario conectado before:", address);
    if (address) {
      console.log("Usuario conectado after:", address);
      
      const t = setTimeout(() => router.replace("/dashboard"), 0);
      return () => clearTimeout(t);
    }

  }, [address, router]);

  if (address) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-500">Redirigiendo al dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6 bg-gradient-to-br from-emerald-50 to-slate-50">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Green Supply Chain</h1>
        <p className="text-slate-600">
          Sistema de trazabilidad y tokenización con flujo controlado por roles (Producer → Factory → Retailer → Consumer).
        </p>
      </section>

      <UserGate />
    </div>
  );
}
