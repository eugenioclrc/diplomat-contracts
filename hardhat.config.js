require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }, 
    ],
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCANKEY,
      polygon: process.env.ETHERSCANKEY,
    },
  },
  networks: {
    hardhat: {
      loggingEnabled: false,
      // url: "http://localhost:8545/",
      /*
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
      forking: {
        url: "https://eth-rinkeby.alchemyapi.io/v2/",
      },
      */
    },
    mumbai: {
      url: 'https://mumbai.infura.io/v3/' + process.env.INFURA_KEY,
      chainId: 80001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    }, 
    neonlabs: {
      url: 'https://proxy.devnet.neonlabs.org/solana',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
      network_id: 245022926,
      chainId: 245022926,
      allowUnlimitedContractSize: false,
      timeout: 1000000,
      isFork: true
    },
    cronos: {
      url: 'https://cronos-testnet-3.crypto.org:8545/',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
      chainId: 338,
      allowUnlimitedContractSize: false,
      timeout: 1000000,
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
      chainId: 44787
    },
    sokol: {
      url: "https://sokol.poa.network/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
      chainId: 77
    },
    kovan: {
      url: "https://kovan.infura.io/v3/" + process.env.INFURA_KEY,
      chainId: 42
    },   
  }
};
