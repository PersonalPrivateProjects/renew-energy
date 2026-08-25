"use client";

import { useContractMetrics } from "../hooks/useContractMetrics";
import { SkeletonCard } from "./ContractSkeleton";

function MetricCard({ title, value, helper }: { title: string; value: string | number; helper: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

export default function ContractMetricsBento() {
  const metrics = useContractMetrics();

  if (metrics.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <div className="md:col-span-2">
        <MetricCard title="Token Types" value={metrics.mintedTokenTypes} helper="IDs ERC-1155 creados" />
      </div>
      <div className="md:col-span-2">
        <MetricCard title="Transfer Offers" value={metrics.transferOffers} helper="Transferencias iniciadas" />
      </div>
      <div className="md:col-span-2">
        <MetricCard title="Transformaciones" value={metrics.transformed} helper="Eventos TokenTransformed" />
      </div>
      <div className="md:col-span-2">
        <MetricCard title="Aceptadas" value={metrics.transfersAccepted} helper="TransferAccepted" />
      </div>
      <div className="md:col-span-2">
        <MetricCard title="Rechazadas" value={metrics.transfersRejected} helper="TransferRejected" />
      </div>
      <div className="md:col-span-2">
        <MetricCard title="Redimidas" value={metrics.redeemed} helper="Eventos Redeemed" />
      </div>
    </div>
  );
}
