import { create } from "zustand";

export type DiagnosticTxEntry = {
    hash: `0x${string}`;
    phase: "sent" | "confirming" | "success" | "error";
    updatedAt: number;
    chainId?: number;
    gasEstimate?: string;
    gasUsed?: string;
    errorMessage?: string;
};

export type DiagnosticLogEntry = {
    eventName: string;
    txHash?: `0x${string}`;
    blockNumber?: string;
    createdAt: number;
};

type DiagnosticsState = {
    txEntries: DiagnosticTxEntry[];
    logs: DiagnosticLogEntry[];
    upsertTx: (entry: DiagnosticTxEntry) => void;
    pushLog: (entry: DiagnosticLogEntry) => void;
    clear: () => void;
};

export const useDiagnosticsStore = create<DiagnosticsState>((set) => ({
    txEntries: [],
    logs: [],
    upsertTx: (entry) =>
        set((state) => {
            const exists = state.txEntries.find((tx) => tx.hash === entry.hash);
            if (exists) {
                return {
                    txEntries: state.txEntries
                        .map((tx) => (tx.hash === entry.hash ? { ...tx, ...entry } : tx))
                        .sort((a, b) => b.updatedAt - a.updatedAt)
                        .slice(0, 20),
                };
            }

            return {
                txEntries: [entry, ...state.txEntries].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20),
            };
        }),
    pushLog: (entry) =>
        set((state) => ({
            logs: [entry, ...state.logs].slice(0, 40),
        })),
    clear: () => set({ txEntries: [], logs: [] }),
}));
