// src/components/TokenCard.tsx
"use client";

import Link from "next/link";
import { prettifyJson } from "../lib/json";

type Props = {
  id: bigint;
  balance: bigint;
  uri: string;
  featuresJson: string;
  parentId: bigint;
};

export default function TokenCard({ id, balance, uri, featuresJson, parentId }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Token #{id.toString()}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Balance: {balance.toString()}</span>
      </div>

      <p className="text-sm text-slate-600"><span className="font-medium">URI:</span> {uri || "—"}</p>
      <p className="text-sm text-slate-600">
        <span className="font-medium">ParentId:</span> {parentId === BigInt(0) ? "— (raíz)" : `#${parentId.toString()}`}
      </p>

      <details className="text-sm group">
        <summary className="cursor-pointer select-none text-slate-500 hover:text-emerald-600 transition-colors">featuresJson</summary>
        <pre className="mt-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto font-mono">
{prettifyJson(featuresJson)}
        </pre>
      </details>

      <div className="pt-1">
      <Link 
      href={`/tokens/detail?id=${id.toString()}`} 
      className="text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium">
        Ver detalles →
      </Link>

      </div>
    </div>
  );
}