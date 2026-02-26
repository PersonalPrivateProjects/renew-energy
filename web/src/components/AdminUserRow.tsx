"use client";

import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";
import { AdminUser } from "../hooks/useAdminUsers";
import { Role, UserStatus, statusLabel } from "../lib/enums";

type Props = {
  user: AdminUser;
  onChanged?: () => void; // para refrescar lista tras acción
};

export default function AdminUserRow({ user, onChanged }: Props) {
  const { writeContractAsync, isPending, error } = useWriteContract();

  // Solo permitir acciones cuando el estado sea Pending
  const isFinal =
    user.status === UserStatus.Approved ||
    user.status === UserStatus.Rejected ||
    user.status === UserStatus.Canceled;

  const canAct = !isPending && !isFinal;

  const approve = async () => {
    await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "approveUser",
      args: [user.address, user.role],   // ✔ mismo rol solicitado
    });
    onChanged?.();
  };

  const reject = async () => {
    await writeContractAsync({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "rejectUser",
      args: [user.address],
    });
    onChanged?.();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <p className="font-mono text-sm text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block">{user.address}</p>

        <p className="text-sm text-slate-600">
          Estado: <span className="font-medium">{statusLabel(user.status)}</span>
        </p>

        <p className="text-sm">
          Rol solicitado:{" "}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {Role[user.role]}
          </span>
        </p>

        <p className="text-xs text-slate-400">
          Último evento: {user.lastEvent} @ #{user.blockNumber.toString()}:{user.logIndex}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={approve}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
          disabled={!canAct}
        >
          Aprobar
        </button>

        <button
          onClick={reject}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
          disabled={!canAct}
        >
          Rechazar
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error.message}</p>}
    </div>
  );
}