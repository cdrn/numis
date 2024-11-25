import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@safe-global/safe-contracts";

const config: HardhatUserConfig = {
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
      mining: {
        auto: true,
        interval: 0,
        mempool: {
          order: "fifo",
        },
      },
      allowBlocksWithSameTimestamp: true,
    },
  },
};

export default config;
