// MusicToken ABI - ERC-1155 for music royalty tokens
export const MusicTokenABI = [
  // Read functions
  {
    inputs: [{ name: "trackId", type: "uint256" }],
    name: "getTrackInfo",
    outputs: [
      {
        components: [
          { name: "title", type: "string" },
          { name: "artist", type: "string" },
          { name: "isrc", type: "string" },
          { name: "totalSupply", type: "uint256" },
          { name: "pricePerToken", type: "uint256" },
          { name: "royaltyPercentage", type: "uint256" },
          { name: "artistWallet", type: "address" },
          { name: "isActive", type: "bool" },
          { name: "createdAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "trackId", type: "uint256" }],
    name: "getAvailableTokens",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalTracks",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "isrc", type: "string" }],
    name: "isrcToTrackId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "trackId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "purchaseTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "trackId", type: "uint256" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "artist", type: "string" },
      { indexed: false, name: "isrc", type: "string" },
      { indexed: false, name: "totalSupply", type: "uint256" },
      { indexed: false, name: "pricePerToken", type: "uint256" },
      { indexed: false, name: "artistWallet", type: "address" },
    ],
    name: "TrackCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "trackId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "totalCost", type: "uint256" },
    ],
    name: "TokensPurchased",
    type: "event",
  },
] as const;

// Marketplace ABI - Secondary market trading
export const MarketplaceABI = [
  // Read functions
  {
    inputs: [{ name: "listingId", type: "uint256" }],
    name: "listings",
    outputs: [
      { name: "seller", type: "address" },
      { name: "trackId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "pricePerToken", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "trackId", type: "uint256" }],
    name: "getFloorPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalVolume",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalTrades",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "listingCounter",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "trackId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "pricePerToken", type: "uint256" },
    ],
    name: "createListing",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "listingId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "listingId", type: "uint256" }],
    name: "cancelListing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "listingId", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: true, name: "trackId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "pricePerToken", type: "uint256" },
    ],
    name: "ListingCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "listingId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "totalPrice", type: "uint256" },
    ],
    name: "TokensSold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "listingId", type: "uint256" }],
    name: "ListingCancelled",
    type: "event",
  },
] as const;

// RoyaltyDistributor ABI
export const RoyaltyDistributorABI = [
  // Read functions
  {
    inputs: [{ name: "distributionId", type: "uint256" }],
    name: "distributions",
    outputs: [
      { name: "trackId", type: "uint256" },
      { name: "totalAmount", type: "uint256" },
      { name: "amountPerToken", type: "uint256" },
      { name: "totalSupplyAtDistribution", type: "uint256" },
      { name: "distributedAt", type: "uint256" },
      { name: "source", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "distributionId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "distributionId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    name: "getClaimableAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "trackId", type: "uint256" }],
    name: "getTrackDistributions",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [{ name: "distributionId", type: "uint256" }],
    name: "claimDistribution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "distributionIds", type: "uint256[]" }],
    name: "claimMultipleDistributions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "distributionId", type: "uint256" },
      { indexed: true, name: "trackId", type: "uint256" },
      { indexed: false, name: "totalAmount", type: "uint256" },
      { indexed: false, name: "source", type: "string" },
    ],
    name: "RoyaltyDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "distributionId", type: "uint256" },
      { indexed: true, name: "claimer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "RoyaltyClaimed",
    type: "event",
  },
] as const;
