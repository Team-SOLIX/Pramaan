require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

// Multiple RPC endpoints for reliability
const MUMBAI_RPCS = [
  'https://rpc-mumbai.matic.today',
  'https://matic-mumbai.chainstacklabs.com',
  'https://polygon-testnet.public.blastapi.io',
  'https://endpoints.omniatech.io/v1/matic/mumbai/public'
];
const MUMBAI_RPC = process.env.MUMBAI_RPC || MUMBAI_RPCS[0];
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    mumbai: {
      url: MUMBAI_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
      timeout: 60000,
      allowUnlimitedContractSize: true
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
};

