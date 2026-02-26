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
    <div className="border rounded p-4 bg-white space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Token #{id.toString()}</h3>
        <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">Balance: {balance.toString()}</span>
      </div>

      <p className="text-sm text-gray-600"><b>URI:</b> {uri || "—"}</p>
      <p className="text-sm text-gray-600">
        <b>ParentId:</b> {parentId === 0n ? "— (raíz)" : `#${parentId.toString()}`}
      </p>

      <details className="text-sm">
        <summary className="cursor-pointer select-none">featuresJson</summary>
        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
{prettifyJson(featuresJson)}
        </pre>
      </details>

      <div className="pt-2">
        
      <Link 
      href={`/tokens/detail?id=${id.toString()}`} 
      className="text-emerald-700 hover:underline text-sm">
        Ver detalles
      </Link>

      </div>
    </div>
  );
}