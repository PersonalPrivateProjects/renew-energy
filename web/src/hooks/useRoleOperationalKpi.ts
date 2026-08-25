"use client";

import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { Role, UserStatus } from "../lib/enums";
import { CONTRACT_ADDRESS } from "../contracts";

type RoleKpi = {
    title: string;
    value: string;
    subtitle: string;
    loading: boolean;
};

const EMPTY_KPI: RoleKpi = {
    title: "Actividad",
    value: "0",
    subtitle: "Sin actividad",
    loading: false,
};

export function useRoleOperationalKpi(params: {
    address?: `0x${string}`;
    role: Role;
    status: UserStatus;
}) {
    const { address, role, status } = params;
    const client = usePublicClient();

    const [kpi, setKpi] = useState<RoleKpi>(EMPTY_KPI);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!client || !address || status !== UserStatus.Approved) {
                if (!cancelled) setKpi(EMPTY_KPI);
                return;
            }

            setKpi((prev) => ({ ...prev, loading: true }));

            try {
                if (role === Role.PRODUCER) {
                    const initiated = await client.getLogs({
                        address: CONTRACT_ADDRESS,
                        event: parseAbiItem("event TransferInitiated(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount)"),
                        args: { from: address },
                        fromBlock: 0n,
                        toBlock: "latest",
                    });

                    const total = initiated.length;
                    if (!cancelled) {
                        setKpi({
                            title: "Transferencias",
                            value: String(total),
                            subtitle: "Iniciadas por ti",
                            loading: false,
                        });
                    }
                    return;
                }

                if (role === Role.FACTORY) {
                    const transformed = await client.getLogs({
                        address: CONTRACT_ADDRESS,
                        event: parseAbiItem("event TokenTransformed(uint256 indexed childId, uint256 indexed parentId, address indexed factory, uint256 amount)"),
                        args: { factory: address },
                        fromBlock: 0n,
                        toBlock: "latest",
                    });

                    if (!cancelled) {
                        setKpi({
                            title: "Transformaciones",
                            value: String(transformed.length),
                            subtitle: "Realizadas por ti",
                            loading: false,
                        });
                    }
                    return;
                }

                if (role === Role.RETAILER) {
                    const initiated = await client.getLogs({
                        address: CONTRACT_ADDRESS,
                        event: parseAbiItem("event TransferInitiated(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount)"),
                        args: { from: address },
                        fromBlock: 0n,
                        toBlock: "latest",
                    });

                    const accepted = await client.getLogs({
                        address: CONTRACT_ADDRESS,
                        event: parseAbiItem("event TransferAccepted(uint256 indexed transferId)"),
                        fromBlock: 0n,
                        toBlock: "latest",
                    });

                    const initiatedIds = new Set(initiated.map((log) => log.args.transferId?.toString()));
                    const acceptedCount = accepted.filter((log) => initiatedIds.has(log.args.transferId?.toString())).length;

                    if (!cancelled) {
                        setKpi({
                            title: "Ventas",
                            value: String(acceptedCount),
                            subtitle: "Completadas",
                            loading: false,
                        });
                    }
                    return;
                }

                if (role === Role.CONSUMER) {
                    const redeemed = await client.getLogs({
                        address: CONTRACT_ADDRESS,
                        event: parseAbiItem("event Redeemed(address indexed consumer, uint256 indexed tokenId, uint256 amount)"),
                        args: { consumer: address },
                        fromBlock: 0n,
                        toBlock: "latest",
                    });

                    const totalConsumed = redeemed.reduce((acc, log) => acc + (log.args.amount ?? 0n), 0n);

                    if (!cancelled) {
                        setKpi({
                            title: "Consumo",
                            value: totalConsumed.toString(),
                            subtitle: "kWh redimidos",
                            loading: false,
                        });
                    }
                    return;
                }

                if (!cancelled) setKpi(EMPTY_KPI);
            } catch {
                if (!cancelled) {
                    setKpi({
                        title: "Actividad",
                        value: "0",
                        subtitle: "No disponible",
                        loading: false,
                    });
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [address, client, role, status]);

    return kpi;
}
