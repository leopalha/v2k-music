import { http, createConfig } from "wagmi";
import { polygon, polygonAmoy, hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [polygon, polygonAmoy, hardhat],
  connectors: [
    injected(),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

// Contract addresses by chain
export const CONTRACT_ADDRESSES: Record<
  number,
  {
    musicToken: `0x${string}`;
    marketplace: `0x${string}`;
    royaltyDistributor: `0x${string}`;
  }
> = {
  // Hardhat local
  31337: {
    musicToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    marketplace: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    royaltyDistributor: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
  // Polygon Amoy Testnet - update after deployment
  80002: {
    musicToken: "0x0000000000000000000000000000000000000000",
    marketplace: "0x0000000000000000000000000000000000000000",
    royaltyDistributor: "0x0000000000000000000000000000000000000000",
  },
  // Polygon Mainnet - update after deployment
  137: {
    musicToken: "0x0000000000000000000000000000000000000000",
    marketplace: "0x0000000000000000000000000000000000000000",
    royaltyDistributor: "0x0000000000000000000000000000000000000000",
  },
};

export function getContractAddresses(chainId: number) {
  return (
    CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[31337]
  );
}
