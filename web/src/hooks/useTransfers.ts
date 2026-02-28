"use client";

import { useEffect, useMemo, useState } from "react";
import { parseEventLogs } from "viem";
import { usePublicClient, useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";
import { Transfer } from "../types/transfer";
import { TransferStatus, Role, UserStatus } from "../lib/enums";

export type TransferEvent = {
  transferId: bigint;
  from: `0x${string}`;
  to: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  status: TransferStatus;
  blockNumber: bigint;
  logIndex: number;
  createdAt: number;
};

export function useTransfersEvents() {
  const client = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!client) return;
      setLoading(true);
      setError(null);
      try {
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock: 0n,
          toBlock: "latest",
        });

        const decoded = parseEventLogs({
          abi: green1155Abi as any,
          logs,
        }) as { eventName: string; args: Record<string, unknown>; blockNumber?: bigint; logIndex?: number }[];

        const events: TransferEvent[] = [];

        for (const ev of decoded) {
          if (ev.eventName === "TransferInitiated") {
            const args = ev.args as any;
            events.push({
              transferId: args.transferId,
              from: args.from,
              to: args.to,
              tokenId: args.tokenId,
              amount: args.amount,
              status: TransferStatus.Pending,
              blockNumber: ev.blockNumber ?? 0n,
              logIndex: Number(ev.logIndex ?? 0),
              createdAt: Date.now(),
            });
          } else if (ev.eventName === "TransferAccepted") {
            const args = ev.args as any;
            const idx = events.findIndex(t => t.transferId === args.transferId);
            if (idx >= 0) {
              events[idx].status = TransferStatus.Accepted;
              events[idx].blockNumber = ev.blockNumber ?? 0n;
              events[idx].logIndex = Number(ev.logIndex ?? 0);
            }
          } else if (ev.eventName === "TransferRejected") {
            const args = ev.args as any;
            const idx = events.findIndex(t => t.transferId === args.transferId);
            if (idx >= 0) {
              events[idx].status = TransferStatus.Rejected;
              events[idx].blockNumber = ev.blockNumber ?? 0n;
              events[idx].logIndex = Number(ev.logIndex ?? 0);
            }
          } else if (ev.eventName === "TransferCanceled") {
            const args = ev.args as any;
            const idx = events.findIndex(t => t.transferId === args.transferId);
            if (idx >= 0) {
              events[idx].status = TransferStatus.Canceled;
              events[idx].blockNumber = ev.blockNumber ?? 0n;
              events[idx].logIndex = Number(ev.logIndex ?? 0);
            }
          }
        }

        events.sort((a, b) => {
          if (a.blockNumber !== b.blockNumber) return Number(b.blockNumber - a.blockNumber);
          return b.logIndex - a.logIndex;
        });

        if (!cancelled) setTransfers(events);
      } catch (e: any) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [client, refreshKey]);

  return { transfers, loading, error, refetch };
}

export function useTransfersInbox() {
  const { address } = useAccount();
  const { transfers, loading, error, refetch } = useTransfersEvents();
  
  const inbox = useMemo(() => 
    transfers.filter(t => t.to === address && t.status === TransferStatus.Pending),
    [transfers, address]
  );
  
  return { transfers: inbox, loading, error, refetch };
}

export function useTransfersOutbox() {
  const { address } = useAccount();
  const { transfers, loading, error, refetch } = useTransfersEvents();
  
  const outbox = useMemo(() => 
    transfers.filter(t => t.from === address && t.status === TransferStatus.Pending),
    [transfers, address]
  );
  
  return { transfers: outbox, loading, error, refetch };
}

export function useTransfersHistory() {
  const { address } = useAccount();
  const { transfers, loading, error, refetch } = useTransfersEvents();
  
  const history = useMemo(() => 
    transfers.filter(t => (t.from === address || t.to === address) && t.status !== TransferStatus.Pending),
    [transfers, address]
  );
  
  return { transfers: history, loading, error, refetch };
}

export function useInitiateTransfer() {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const initiate = (to: `0x${string}`, tokenId: bigint, amount: bigint) => {
    writeContract({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "initiateTransfer",
      args: [to, tokenId, amount]
    });
  };
  
  return { initiate, isPending, hash, isConfirming, isSuccess };
}

export function useAcceptTransfer() {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const accept = (transferId: bigint) => {
    writeContract({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "acceptTransfer",
      args: [transferId]
    });
  };
  
  return { accept, isPending, hash, isConfirming, isSuccess };
}

export function useRejectTransfer() {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const reject = (transferId: bigint) => {
    writeContract({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "rejectTransfer",
      args: [transferId]
    });
  };
  
  return { reject, isPending, hash, isConfirming, isSuccess };
}

export function useCancelTransfer() {
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const cancel = (transferId: bigint) => {
    writeContract({
      abi: green1155Abi,
      address: CONTRACT_ADDRESS,
      functionName: "cancelTransfer",
      args: [transferId]
    });
  };
  
  return { cancel, isPending, hash, isConfirming, isSuccess };
}

export function useApprovedUsersByRole(targetRole: Role) {
  const client = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<`0x${string}`[]>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!client) return;
      setLoading(true);
      try {
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock: 0n,
          toBlock: "latest",
        });

        const decoded = parseEventLogs({
          abi: green1155Abi as any,
          logs,
        }) as { eventName: string; args: Record<string, unknown> }[];

        const approvedUsers = new Set<string>();

        for (const ev of decoded) {
          if (ev.eventName === "UserApproved") {
            const args = ev.args as any;
            if (Number(args.role) === targetRole) {
              approvedUsers.add(args.user.toLowerCase());
            }
          }
        }

        if (!cancelled) setUsers(Array.from(approvedUsers) as `0x${string}`[]);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [client, targetRole]);

  return { users, loading };
}
