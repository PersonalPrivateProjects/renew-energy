// ABI mínima necesaria para la fase de registro/estado.
// NOTA: Si luego agregamos Admin/Transfers/Tokens, extendemos este ABI.
export const green1155Abi = [
  {
    "type": "function",
    "name": "users",
    "stateMutability": "view",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [
      { "name": "role", "type": "uint8" },
      { "name": "status", "type": "uint8" }
    ]
  },
  {
    "type": "function",
    "name": "register",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "role", "type": "uint8" }],
    "outputs": []
  }
] as const;
