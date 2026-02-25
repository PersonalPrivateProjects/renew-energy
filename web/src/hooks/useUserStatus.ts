"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";

// Hook que consulta users(address) y retorna role/status.
// Se reutiliza en cualquier página que necesite gating por estado.
export function useUserStatus(addressOverride?: `0x${string}`) {
  const { address } = useAccount();
  const addr = (addressOverride ?? address) as `0x${string}` | undefined;

  const { data, isLoading, refetch, error } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "users",
    args: addr ? [addr] : undefined,
    query: {
      enabled: Boolean(addr), // solo lee si hay address
      refetchOnWindowFocus: false
    }
  });

  const role = (data?.[0] as number | undefined) ?? 0;
  const status = (data?.[1] as number | undefined) ?? 0;

  return { role, status, isLoading, refetch, error };
}