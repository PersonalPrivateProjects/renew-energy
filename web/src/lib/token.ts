// src/lib/token.ts
import { Address } from "viem";
import { CONTRACT_ADDRESS, green1155Abi } from "../contracts";
import { readContract, readContracts } from "@wagmi/core";
import { config } from "../lib/wagmi"; // 👈 usa el config compartido

// Obtiene nextTokenId y balances del usuario para todos los ids [1..nextTokenId]
export async function fetchUserBalancesAll(address: Address) {
  const nextId = (await readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: green1155Abi,
    functionName: "nextTokenId",
  })) as bigint;

  if (nextId === 0n) {
    return { nextId, items: [] as { id: bigint; balance: bigint }[] };
  }

  const calls = [];
  for (let id = 1n; id <= nextId; id++) {
    calls.push({
      address: CONTRACT_ADDRESS,
      abi: green1155Abi,
      functionName: "balanceOf",
      args: [address, id],
    } as const);
  }

  const results = (await readContracts(config, { contracts: calls })) as { result: bigint }[];

  const items = results
    .map((r, i) => ({ id: BigInt(i + 1), balance: r.result }))
    .filter((x) => x.balance > 0n);

  return { nextId, items };
}

export async function fetchTokenMetadataBatch(ids: bigint[]) {
  if (ids.length === 0) return [];

  const calls = ids.flatMap((id) => ([
    {
      address: CONTRACT_ADDRESS,
      abi: green1155Abi,
      functionName: "uri",
      args: [id],
    } as const,
    {
      address: CONTRACT_ADDRESS,
      abi: green1155Abi,
      functionName: "featuresOf",
      args: [id],
    } as const,
    {
      address: CONTRACT_ADDRESS,
      abi: green1155Abi,
      functionName: "parentOf",
      args: [id],
    } as const,
  ]));

  const results = await readContracts(config, { contracts: calls });

  const out: { id: bigint; uri: string; featuresJson: string; parentId: bigint }[] = [];
  for (let i = 0; i < ids.length; i++) {
    const base = i * 3;
    out.push({
      id: ids[i],
      uri: String(results[base]?.result ?? ""),
      featuresJson: String(results[base + 1]?.result ?? ""),
      parentId: BigInt(results[base + 2]?.result as string | number | bigint | boolean ?? 0),
    });
  }
  return out;
}