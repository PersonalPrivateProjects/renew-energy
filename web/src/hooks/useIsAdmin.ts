"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";

export function useIsAdmin() {
  const { address } = useAccount();

  const { data: adminRole, isLoading: loadingRole, error: roleErr } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: isAdmin, isLoading: loadingCheck, error: checkErr } = useReadContract({
    abi: green1155Abi,
    address: CONTRACT_ADDRESS,
    functionName: "hasRole",
    args: adminRole && address ? [adminRole as `0x${string}`, address] : undefined,
    query: { enabled: Boolean(adminRole && address) },
  });

  return {
    isAdmin: Boolean(isAdmin),
    isLoading: loadingRole || loadingCheck,
    error: roleErr || checkErr,
  };
}