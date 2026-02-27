// src/app/tokens/detail/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { prettifyJson } from "../../../lib/json";
import { useSearchParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../../../contracts";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { getValidRecipients, roleLabel } from "../../../lib/enums";
import { StartTransferDialog } from "../../../components/StartTransferDialog";
import Link from "next/link";

function TokenDetailsContent() {
  const sp = useSearchParams();
  const idParam = sp.get("id");
  const id = idParam ? BigInt(idParam) : null;

  const { address } = useAccount();
  const { role, status } = useUserStatus();
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const { data: balance, refetch } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: id && address ? [address, id] : undefined,
    query: { enabled: Boolean(id && address), refetchInterval: refreshKey > 0 ? 1000 : false },
  });

  const canTransfer = status === 2 && getValidRecipients(role).length > 0 && (balance ?? BigInt(0)) > BigInt(0);

  useEffect(() => {
    if (showTransferDialog === false && refreshKey > 0) {
      refetch();
    }
  }, [showTransferDialog, refreshKey, refetch]);

  const handleTransferSuccess = () => {
    setRefreshKey(k => k + 1);
    setTimeout(() => refetch(), 1500);
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Token #{id.toString()}</h2>
        <Link href="/tokens" className="text-sm text-blue-600 hover:underline">
          ← Volver a Tokens
        </Link>
      </div>

      <div className="p-4 border rounded bg-white space-y-2">
        <p><b>Balance (tú):</b> {balance ? String(balance) : "0"}</p>
        <p><b>ParentId:</b> {typeof parentId === "bigint" ? (parentId === BigInt(0) ? "— (raíz)" : `#${parentId}`) : "—"}</p>
        <p><b>URI:</b> {uri ? String(uri) : "—"}</p>
      </div>

      <div className="p-4 border rounded bg-white">
        <p className="font-semibold mb-2">featuresJson</p>
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
{prettifyJson(String(featuresJson ?? ""))}
        </pre>
      </div>

      {status === 2 && (
        <div className="p-4 border rounded bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">
            <b>Tu rol:</b> {roleLabel(role)}
            {canTransfer && (
              <> · Puedes transferir a: {getValidRecipients(role).map(r => roleLabel(r)).join(", ")}</>
            )}
          </p>
          
          {canTransfer ? (
            <button
              onClick={() => setShowTransferDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Transferir
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              {getValidRecipients(role).length === 0
                ? "Tu rol no puede iniciar transferencias"
                : (balance ?? BigInt(0)) === BigInt(0)
                ? "No tienes balance de este token para transferir"
                : "No puedes transferir"}
            </p>
          )}
        </div>
      )}

      <StartTransferDialog
        isOpen={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        tokenId={id}
        tokenBalance={balance ?? BigInt(0)}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
}

export default function TokenDetailsPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando...</div>}>
      <TokenDetailsContent />
    </Suspense>
  );
}
