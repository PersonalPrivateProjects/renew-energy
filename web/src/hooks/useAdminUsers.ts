"use client";

import { useEffect, useMemo, useState } from "react";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";
import { Role, UserStatus } from "../lib/enums";

export type AdminUser = {
  address: `0x${string}`;
  role: Role;
  status: UserStatus;
  lastEvent: string;       // UserRegistered | UserApproved | ...
  blockNumber: bigint;     // para ordenar cronológicamente
  logIndex: number;
};

export function useAdminUsers() {
  const client = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!client) return;
      setLoading(true);
      setError(null);
      try {
        // Traer todos los logs del contrato
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock: BigInt(0),
          toBlock: "latest",
        });

        // Decodificar vía viem usando el ABI
        const decoded = parseEventLogs({
          abi: green1155Abi as any,
          logs,
        }) as { eventName: string; args: Record<string, unknown>; blockNumber?: bigint; logIndex?: number }[];

        // Reconstruir estado por address
        type Entry = { role: Role; status: UserStatus; lastEvent: string; blockNumber: bigint; logIndex: number };
        const byAddr = new Map<string, Entry>();

        for (const ev of decoded) {
          // Sólo eventos de usuario
          if (
            ev.eventName !== "UserRegistered" &&
            ev.eventName !== "UserApproved" &&
            ev.eventName !== "UserRejected" &&
            ev.eventName !== "UserCanceled"
          ) continue;

          const addr = (ev.args as any).user as `0x${string}`;
          const blockNumber = ev.blockNumber ?? 0n;
          const logIndex = Number(ev.logIndex ?? 0);

          const prev = byAddr.get(addr.toLowerCase());
          // Para mantener orden consistente, comparamos (blockNumber, logIndex)
          const shouldApply =
            !prev ||
            blockNumber > prev.blockNumber ||
            (blockNumber === prev.blockNumber && logIndex > prev.logIndex);

          if (!shouldApply) continue;

          if (ev.eventName === "UserRegistered") {
            const role = Number((ev.args as any).role ?? 0) as Role;
            byAddr.set(addr.toLowerCase(), {
              role,
              status: UserStatus.Pending,
              lastEvent: "UserRegistered",
              blockNumber,
              logIndex,
            });
          } else if (ev.eventName === "UserApproved") {
            const role = Number((ev.args as any).role ?? 0) as Role;
            byAddr.set(addr.toLowerCase(), {
              role,
              status: UserStatus.Approved,
              lastEvent: "UserApproved",
              blockNumber,
              logIndex,
            });
          } else if (ev.eventName === "UserRejected") {
            const prevRole = prev?.role ?? Role.NONE;
            byAddr.set(addr.toLowerCase(), {
              role: prevRole,
              status: UserStatus.Rejected,
              lastEvent: "UserRejected",
              blockNumber,
              logIndex,
            });
          } else if (ev.eventName === "UserCanceled") {
            const prevRole = prev?.role ?? Role.NONE;
            byAddr.set(addr.toLowerCase(), {
              role: prevRole,
              status: UserStatus.Canceled,
              lastEvent: "UserCanceled",
              blockNumber,
              logIndex,
            });
          }
        }

        const items: AdminUser[] = Array.from(byAddr.entries()).map(([addr, v]) => ({
          address: addr as `0x${string}`,
          role: v.role,
          status: v.status,
          lastEvent: v.lastEvent,
          blockNumber: v.blockNumber,
          logIndex: v.logIndex,
        }));

        // Ordenar por blockNumber/logIndex descendente (recientes primero)
        items.sort((a, b) => (a.blockNumber === b.blockNumber ? b.logIndex - a.logIndex : Number(b.blockNumber - a.blockNumber)));

        if (!cancelled) setUsers(items);
      } catch (e: any) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [client]);

  const pending = useMemo(() => users.filter(u => u.status === UserStatus.Pending), [users]);

  return { users, pending, loading, error };
}