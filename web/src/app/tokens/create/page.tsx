// src/app/tokens/create/page.tsx
"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { green1155Abi } from "../../../contracts/green1155.abi";
import { CONTRACT_ADDRESS } from "../../../contracts";
import { Role, UserStatus } from "../../../lib/enums";
import { tryParseJson } from "../../../lib/json";
import { useUserStatus } from "../../../hooks/useUserStatus";

export default function TokenCreatePage() {
  const { isConnected } = useAccount();
  const { role, status } = useUserStatus();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const [amount, setAmount] = useState<number>(0);
  const [tokenUri, setTokenUri] = useState<string>("");
  const [features, setFeatures] = useState<string>('{"kWh":100,"fuente":"solar"}');
  const [txHash, setTxHash] = useState<string>("");

  const canCreate =
    isConnected && status === UserStatus.Approved && role === Role.PRODUCER;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    if (!amount || amount <= 0) return alert("Amount debe ser > 0");

    // Validar JSON (opcional, mejora de UX)
    const chk = tryParseJson(features);
    if (!chk.ok) return alert("featuresJson inválido: " + chk.error);

    const hash = await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "mintRaw",
      args: [BigInt(amount), tokenUri.trim(), features.trim()]
    });
    setTxHash(String(hash));
  };

  if (!canCreate) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Crear materia prima</h2>
        <div className="p-4 border rounded bg-white">
          Solo usuarios <b>Producer</b> aprobados pueden crear tokens raíz.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Crear materia prima</h2>
      <form onSubmit={onSubmit} className="space-y-4 p-4 border rounded bg-white max-w-xl">
        <div>
          <label className="block text-sm font-medium">Cantidad (amount)</label>
          <input
            type="number"
            min={1}
            className="mt-1 w-full border rounded p-2"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Token URI (IPFS/HTTP) — opcional</label>
          <input
            className="mt-1 w-full border rounded p-2"
            placeholder="ipfs://... o https://..."
            value={tokenUri}
            onChange={(e) => setTokenUri(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">featuresJson (on-chain)</label>
          <textarea
            className="mt-1 w-full border rounded p-2 font-mono text-sm"
            rows={6}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Ej: {"{ \"kWh\": 100, \"fuente\": \"solar\" }"}</p>
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}
        {txHash && (
          <p className="text-sm text-emerald-700">
            Transacción enviada: <span className="font-mono">{txHash}</span>
          </p>
        )}

        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Enviando…" : "Crear token"}
        </button>
      </form>
    </div>
  );
}