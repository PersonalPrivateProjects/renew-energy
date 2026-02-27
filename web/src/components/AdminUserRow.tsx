"use client";

import { useWriteContract, usePublicClient } from "wagmi"; // 👈 añade usePublicClient
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";
import { AdminUser } from "../hooks/useAdminUsers";
import { Role, UserStatus, statusLabel } from "../lib/enums";

type Props = {
  user: AdminUser;
  onChanged?: () => void; // para refrescar lista tras acción
};

export default function AdminUserRow({ user, onChanged }: Props) {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const publicClient = usePublicClient(); // 👈 nuevo

  // Solo permitir acciones cuando el estado sea Pending
  const isFinal =
    user.status === UserStatus.Approved ||
    user.status === UserStatus.Rejected ||
    user.status === UserStatus.Canceled;

  const canAct = !isPending && !isFinal;

  const approve = async () => {
    const hash = await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "approveUser",
      args: [user.address, user.role],
    });
    // ✅ esperar confirmación en cadena
    await publicClient!.waitForTransactionReceipt({ hash });
    onChanged?.();
  };

  const reject = async () => {
    const hash = await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "rejectUser",
      args: [user.address],
    });
    // ✅ esperar confirmación
    await publicClient!.waitForTransactionReceipt({ hash });
    onChanged?.();
  };

  return (
    <div className="border rounded p-3 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="space-y-1">
        <p className="font-mono text-sm">{user.address}</p>

        <p className="text-sm text-gray-600">
          Estado: <b>{statusLabel(user.status)}</b>
        </p>

        <p className="text-sm">
          Rol solicitado:{" "}
          <span className="px-2 py-0.5 rounded bg-gray-100">
            {Role[user.role]}
          </span>
        </p>

        <p className="text-xs text-gray-500">
          Último evento: {user.lastEvent} @ #{user.blockNumber.toString()}:{user.logIndex}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={approve}
          className="bg-emerald-600 text-white text-sm px-3 py-2 rounded disabled:opacity-50"
          disabled={!canAct}
        >
          Aprobar
        </button>

        <button
          onClick={reject}
          className="bg-red-600 text-white text-sm px-3 py-2 rounded disabled:opacity-50"
          disabled={!canAct}
        >
          Rechazar
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
