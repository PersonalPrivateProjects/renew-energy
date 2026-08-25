"use client";

import { useMemo } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

export type TxPhase = "idle" | "signing" | "sent" | "confirming" | "success" | "error";

type Params = {
    hash?: `0x${string}`;
    isWriting: boolean;
    error?: Error | null;
};

export function useTransactionLifecycle({ hash, isWriting, error }: Params) {
    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
        query: { enabled: Boolean(hash) },
    });

    const phase = useMemo<TxPhase>(() => {
        if (error) return "error";
        if (isWriting && !hash) return "signing";
        if (hash && isConfirmed) return "success";
        if (hash && isConfirming) return "confirming";
        if (hash) return "sent";
        return "idle";
    }, [error, hash, isWriting, isConfirming, isConfirmed]);

    return {
        phase,
        receipt,
        isConfirming,
        isConfirmed,
    };
}
