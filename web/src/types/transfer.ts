import { TransferStatus } from "../lib/enums";

export interface Transfer {
  id: bigint;
  from: `0x${string}`;
  to: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  status: TransferStatus;
  createdAt: bigint;
}

export interface TransferWithToken extends Transfer {
  tokenName: string;
  tokenUri: string;
  features: Record<string, unknown> | null;
}
