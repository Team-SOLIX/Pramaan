const { Web3 } = require('web3');
const dotenv = require('dotenv');

dotenv.config();

async function testBlockchainConnection() {
  console.log('🔍 Testing blockchain connection...');
  
  const rpcUrl = process.env.MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com/';
  const contractAddress = process.env.CERT_REGISTRY_ADDRESS;
  
  console.log('RPC URL:', rpcUrl);
  console.log('Contract Address:', contractAddress || 'Not set');
  
  try {
    const web3 = new Web3(rpcUrl);
    
    // Test connection
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('✅ Connected to Mumbai. Current block:', blockNumber);
    
    // Test contract if address is provided
    if (contractAddress) {
      const contractAbi = [
        { "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }], "name": "verifyCertificate", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
      ];
      
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      
      // Test with a dummy hash
      const testHash = '0x' + '0'.repeat(64);
      const result = await contract.methods.verifyCertificate(testHash).call();
      console.log('✅ Contract is accessible. Test verification result:', result);
    } else {
      console.log('⚠️  Contract address not set. Deploy contract first.');
    }
    
    // Test private key if provided
    if (process.env.DEPLOYER_PRIVATE_KEY) {
      const account = web3.eth.accounts.wallet.add(process.env.DEPLOYER_PRIVATE_KEY);
      const balance = await web3.eth.getBalance(account.address);
      console.log('✅ Deployer account balance:', web3.utils.fromWei(balance, 'ether'), 'MATIC');
    }
    
  } catch (error) {
    console.log('❌ Blockchain connection failed:', error.message);
  }
}

testBlockchainConnection();
