// Debe alinear con el contrato:
// enum Role { NONE, PRODUCER, FACTORY, RETAILER, CONSUMER }
// enum UserStatus { None, Pending, Approved, Rejected, Canceled }

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