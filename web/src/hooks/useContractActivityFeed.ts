"use client";

import { useEffect, useState } from "react";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";

function stringifyWithBigInt(value: unknown): string {
    return JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v));
}

export type ContractActivityItem = {
    eventName: string;
    txHash?: `0x${string}`;
    blockNumber: bigint;
    logIndex: number;
    createdAt: number;
    argsPreview: string;
};

export function useContractActivityFeed(limit = 30) {
    const client = usePublicClient();
    const [items, setItems] = useState<ContractActivityItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refetch = () => setRefreshKey((k) => k + 1);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!client) return;
            setLoading(true);
            setError(null);
            try {
                const latest = await client.getBlockNumber();
                const fromBlock = latest > 4000n ? latest - 4000n : 0n;

                const logs = await client.getLogs({
                    address: CONTRACT_ADDRESS,
                    fromBlock,
                    toBlock: "latest",
                });

                const decoded = parseEventLogs({
                    abi: green1155Abi,
                    logs,
                    strict: false,
                }) as { eventName: string; args?: Record<string, unknown>; blockNumber?: bigint; logIndex?: number; transactionHash?: `0x${string}` }[];

                const mapped: ContractActivityItem[] = decoded.map((ev) => ({
                    eventName: ev.eventName,
                    txHash: ev.transactionHash,
                    blockNumber: ev.blockNumber ?? 0n,
                    logIndex: Number(ev.logIndex ?? 0),
                    createdAt: Date.now(),
                    argsPreview: stringifyWithBigInt(ev.args ?? {}),
                }));

                mapped.sort((a, b) => {
                    if (a.blockNumber !== b.blockNumber) return Number(b.blockNumber - a.blockNumber);
                    return b.logIndex - a.logIndex;
                });

                if (!cancelled) {
                    setItems(mapped.slice(0, limit));
                }
            } catch (e) {
                if (!cancelled) setError(e as Error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        const id = setInterval(run, 5000);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [client, limit, refreshKey]);

    return { items, loading, error, refetch };
}
