// src/app/tokens/detail/page.tsx
"use client";

import { prettifyJson } from "../../../lib/json";
import { useSearchParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../../../contracts";

export default function TokenDetailsPage() {
  const sp = useSearchParams();
  const idParam = sp.get("id");
  const id = idParam ? BigInt(idParam) : null;

  const { address } = useAccount();

  const { data: uri } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "uri",
    args: id ? [id] : undefined,
    query: { enabled: Boolean(id) },
  });

  const { data: featuresJson } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "featuresOf",
    args: id ? [id] : undefined,
    query: { enabled: Boolean(id) },
  });

  const { data: parentId } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "parentOf",
    args: id ? [id] : undefined,
    query: { enabled: Boolean(id) },
  });

  const { data: balance } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: id && address ? [address, id] : undefined,
    query: { enabled: Boolean(id && address) },
  });

  if (!id) {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Detalle de Token</h2>
        <div className="p-4 border rounded bg-white">
          Falta el parámetro <b>id</b>. Usa la lista de tokens para navegar hasta aquí.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Token #{id.toString()}</h2>

      <div className="p-4 border rounded bg-white space-y-2">
        <p><b>Balance (tú):</b> {balance ? String(balance) : "0"}</p>
        <p><b>ParentId:</b> {typeof parentId === "bigint" ? (parentId === 0n ? "— (raíz)" : `#${parentId}`) : "—"}</p>
        <p><b>URI:</b> {uri ? String(uri) : "—"}</p>
      </div>

      <div className="p-4 border rounded bg-white">
        <p className="font-semibold mb-2">featuresJson</p>
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
{prettifyJson(String(featuresJson ?? ""))}
        </pre>
      </div>
    </div>
  );
}