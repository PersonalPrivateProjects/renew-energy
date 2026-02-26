// Debe alinear con el contrato:
// enum Role { NONE, PRODUCER, FACTORY, RETAILER, CONSUMER }
// enum UserStatus { None, Pending, Approved, Rejected, Canceled }
// enum TransferStatus { None, Pending, Accepted, Rejected, Canceled }

export enum Role {
  NONE = 0,
  PRODUCER = 1,
  FACTORY = 2,
  RETAILER = 3,
  CONSUMER = 4
}

export enum UserStatus {
  None = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Canceled = 4
}

export enum TransferStatus {
  None = 0,
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
  Canceled = 4
}

export const roleOptions = [
  { label: "Producer", value: Role.PRODUCER },
  { label: "Factory", value: Role.FACTORY },
  { label: "Retailer", value: Role.RETAILER },
  { label: "Consumer", value: Role.CONSUMER }
];

export const statusLabel = (s?: number) =>
  ({
    [UserStatus.None]: "No registrado",
    [UserStatus.Pending]: "Pendiente de aprobación",
    [UserStatus.Approved]: "Aprobado",
    [UserStatus.Rejected]: "Rechazado",
    [UserStatus.Canceled]: "Cancelado"
  } as Record<number, string>)[s ?? UserStatus.None] ?? "—";

export const transferStatusLabel = (s?: number) =>
  ({
    [TransferStatus.None]: "Ninguno",
    [TransferStatus.Pending]: "Pendiente",
    [TransferStatus.Accepted]: "Aceptado",
    [TransferStatus.Rejected]: "Rechazado",
    [TransferStatus.Canceled]: "Cancelado"
  } as Record<number, string>)[s ?? TransferStatus.None] ?? "—";

export const roleLabel = (r?: number) =>
  ({
    [Role.NONE]: "Admin",
    [Role.PRODUCER]: "Producer",
    [Role.FACTORY]: "Factory",
    [Role.RETAILER]: "Retailer",
    [Role.CONSUMER]: "Consumer"
  } as Record<number, string>)[r ?? Role.NONE] ?? "—";

export function isValidFlow(fromRole: Role, toRole: Role): boolean {
  if (fromRole === Role.PRODUCER && toRole === Role.FACTORY) return true;
  if (fromRole === Role.FACTORY && toRole === Role.RETAILER) return true;
  if (fromRole === Role.RETAILER && toRole === Role.CONSUMER) return true;
  return false;
}

export function getValidRecipients(myRole: Role): Role[] {
  switch (myRole) {
    case Role.PRODUCER:
      return [Role.FACTORY];
    case Role.FACTORY:
      return [Role.RETAILER];
    case Role.RETAILER:
      return [Role.CONSUMER];
    default:
      return [];
  }
}