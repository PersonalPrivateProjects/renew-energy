"use client";

import { useChainId, useSwitchChain } from "wagmi";

const ANVIL_CHAIN_ID = 31337;

export function useAnvilNetwork() {
    const chainId = useChainId();
    const { switchChain, isPending, error } = useSwitchChain();

    const isOnAnvil = chainId === ANVIL_CHAIN_ID;

    const switchToAnvil = () => {
        switchChain({ chainId: ANVIL_CHAIN_ID });
    };

    return {
        chainId,
        expectedChainId: ANVIL_CHAIN_ID,
        isOnAnvil,
        isSwitching: isPending,
        switchError: error,
        switchToAnvil,
    };
}
