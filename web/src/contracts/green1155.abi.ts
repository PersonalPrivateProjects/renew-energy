// src/contracts/green1155.abi.ts
export const green1155Abi = [
  // --- User management (getters / actions) ---
  {
    type: "function",
    name: "users",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "role", type: "uint8" },
      { name: "status", type: "uint8" }
    ]
  },
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [{ name: "role", type: "uint8" }],
    outputs: []
  },
  {
    type: "function",
    name: "approveUser",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "role", type: "uint8" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "rejectUser",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: []
  },

  // --- AccessControl admin checks ---
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    // DEFAULT_ADMIN_ROLE getter (public constant)
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }]
  },

  // --- ERC-1155 reads (si ya estaban, mantenlos) ---
  { type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }, { name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  { type: "function", name: "uri", stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "string" }]
  },
  { type: "function", name: "exists", stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }]
  },
  { type: "function", name: "nextTokenId", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "parentOf", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "featuresOf", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "", type: "string" }] },

  // --- Token actions (si ya estaban, mantenlos) ---
  {
    type: "function",
    name: "mintRaw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "tokenUri", type: "string" },
      { name: "featuresJson", type: "string" }
    ],
    outputs: [{ name: "tokenId", type: "uint256" }]
  },
  {
    type: "function",
    name: "transform",
    stateMutability: "nonpayable",
    inputs: [
      { name: "parentId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "childUri", type: "string" },
      { name: "featuresJson", type: "string" }
    ],
    outputs: [{ name: "childId", type: "uint256" }]
  },

  // --- Transfers (escrow) ---
  {
    type: "function",
    name: "transfers",
    stateMutability: "view",
    inputs: [{ name: "transferId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "createdAt", type: "uint64" }
    ]
  },
  {
    type: "function",
    name: "nextTransferId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "initiateTransfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "acceptTransfer",
    stateMutability: "nonpayable",
    inputs: [{ name: "transferId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "rejectTransfer",
    stateMutability: "nonpayable",
    inputs: [{ name: "transferId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "cancelTransfer",
    stateMutability: "nonpayable",
    inputs: [{ name: "transferId", type: "uint256" }],
    outputs: []
  },

  // --- Redeem (Consumer) ---
  {
    type: "function",
    name: "redeem",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },

  // --- User events ---
  {
    type: "event",
    name: "UserRegistered",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "role", type: "uint8", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "UserApproved",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "role", type: "uint8", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "UserRejected",
    inputs: [{ name: "user", type: "address", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "UserCanceled",
    inputs: [{ name: "user", type: "address", indexed: true }],
    anonymous: false
  },

  // --- Token events ---
  {
    type: "event",
    name: "TokenCreated",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: false },
      { name: "role", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "parentId", type: "uint256", indexed: false },
      { name: "uri", type: "string", indexed: false },
      { name: "featuresJson", type: "string", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "TokenTransformed",
    inputs: [
      { name: "childId", type: "uint256", indexed: true },
      { name: "parentId", type: "uint256", indexed: true },
      { name: "factory", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ],
    anonymous: false
  },

  // --- Transfer events ---
  {
    type: "event",
    name: "TransferInitiated",
    inputs: [
      { name: "transferId", type: "uint256", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "TransferAccepted",
    inputs: [{ name: "transferId", type: "uint256", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "TransferRejected",
    inputs: [{ name: "transferId", type: "uint256", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "TransferCanceled",
    inputs: [{ name: "transferId", type: "uint256", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "Redeemed",
    inputs: [
      { name: "consumer", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
] as const;