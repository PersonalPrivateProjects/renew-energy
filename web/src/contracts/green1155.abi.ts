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
] as const;