"use client";

import { TxPhase } from "../hooks/useTransactionLifecycle";

type Props = {
  phase: TxPhase;
  hash?: `0x${string}`;
  errorMessage?: string;
  gasEstimate?: string;
  gasUsed?: string;
};

export default function TransactionLifecycleCard({ phase, hash, errorMessage, gasEstimate, gasUsed }: Props) {
  if (phase === "idle") return null;

  const steps = [
    { id: "signing", label: "Firma en wallet" },
    { id: "sent", label: "Enviada a Anvil" },
    { id: "confirming", label: "Confirmación en bloque" },
    { id: "success", label: "Confirmada" },
  ] as const;

  const progressByPhase: Record<TxPhase, number> = {
    idle: 0,
    signing: 1,
    sent: 2,
    confirming: 3,
    success: 4,
    error: 0,
  };

  const progress = progressByPhase[phase];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">Estado de transacción</h4>
      <div className="grid grid-cols-2 gap-2">
        {steps.map((step, idx) => {
          const done = progress > idx + 1 || phase === "success";
          const active = progress === idx + 1;
          return (
            <div
              key={step.id}
              className={`rounded-lg border px-3 py-2 text-xs ${
                done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>

      {hash && <p className="text-xs text-slate-600 break-all">Hash: {hash}</p>}
      {gasEstimate && <p className="text-xs text-slate-600">Gas estimado: {gasEstimate}</p>}
      {gasUsed && <p className="text-xs text-slate-600">Gas usado: {gasUsed}</p>}
      {phase === "error" && <p className="text-xs text-red-600">Error: {errorMessage ?? "Transacción fallida"}</p>}
    </div>
  );
}
