import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "@symfoni/hardhat-react";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades"
import "hardhat-typechain";
import "@typechain/ethers-v5";
import "dotenv/config"
import "solidity-coverage"
import "hardhat-gas-reporter"
import "@nomiclabs/hardhat-etherscan"
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  react: {
    providerPriority: ["web3modal", "hardhat"],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      blockGasLimit: 124500000000
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      gas: 2100000,
      gasPrice: 8000000000
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  typechain: {
    outDir: "./frontend/src/hardhat/typechain",
  },
  paths: {
    react: "./frontend/src/hardhat",
    deployments: "./frontend/src/hardhat/deployments",
  },
  gasReporter: {
    currency: 'USD',
    // gasPrice: 100,
    enabled: true,
    coinmarketcap: "688c41ae-4962-43f0-8ffa-e07c027692d0"
  },

};
export default config;
