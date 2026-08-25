"use client";

import { useEffect, useMemo, useState } from "react";
import { parseEventLogs } from "viem";
import { usePublicClient, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";

export function useContractMetrics() {
    const client = usePublicClient();
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [eventCounters, setEventCounters] = useState({
        transfersPending: 0,
        transfersAccepted: 0,
        transfersRejected: 0,
        transfersCanceled: 0,
        transformed: 0,
        redeemed: 0,
    });

    const { data: nextTokenId, isLoading: loadingTokens } = useReadContract({
        abi: green1155Abi,
        address: CONTRACT_ADDRESS,
        functionName: "nextTokenId",
    });

    const { data: nextTransferId, isLoading: loadingTransfers } = useReadContract({
        abi: green1155Abi,
        address: CONTRACT_ADDRESS,
        functionName: "nextTransferId",
    });

    useEffect(() => {
        const cancelled = false;

        const run = async () => {
            if (!client) return;
            setLoadingEvents(true);
            try {
                const latest = await client.getBlockNumber();
                const fromBlock = latest > 4000n ? latest - 4000n : 0n;

                const logs = await client.getLogs({
                    address: CONTRACT_ADDRESS,
                    fromBlock,
                    toBlock: "latest",
                });

                const decoded = parseEventLogs({ abi: green1155Abi, logs, strict: false }) as { eventName: string }[];

                const counters = {
                    transfersPending: 0,
                    transfersAccepted: 0,
                    transfersRejected: 0,
                    transfersCanceled: 0,
                    transformed: 0,
                    redeemed: 0,
                };

                for (const ev of decoded) {
                    if (ev.eventName === "TransferInitiated") counters.transfersPending += 1;
                    if (ev.eventName === "TransferAccepted") counters.transfersAccepted += 1;
                    if (ev.eventName === "TransferRejected") counters.transfersRejected += 1;
                    if (ev.eventName === "TransferCanceled") counters.transfersCanceled += 1;
                    if (ev.eventName === "TokenTransformed") counters.transformed += 1;
                    if (ev.eventName === "Redeemed") counters.redeemed += 1;
                }

                if (!cancelled) setEventCounters(counters);
            } finally {
                if (!cancelled) setLoadingEvents(false);
            }
        };

        run();
    }, [client]);

    const loading = loadingTokens || loadingTransfers || loadingEvents;

    return useMemo(() => ({
        loading,
        mintedTokenTypes: Number(nextTokenId ?? 0n),
        transferOffers: Number(nextTransferId ?? 0n),
        ...eventCounters,
    }), [loading, nextTokenId, nextTransferId, eventCounters]);
}
