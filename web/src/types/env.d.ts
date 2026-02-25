declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CONTRACT_ADDRESS: `0x${string}`;
    NEXT_PUBLIC_CHAIN_ID?: string;
    NEXT_PUBLIC_RPC_HTTP?: string;
  }
}
