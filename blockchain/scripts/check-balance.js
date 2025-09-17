const { ethers, network } = require('hardhat');

async function main() {
  console.log(`Checking balance on network: ${network.name}`);
  
  const [deployer] = await ethers.getSigners();
  console.log('Account:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInMatic = ethers.formatEther(balance);
  
  console.log('Balance:', balanceInMatic, 'MATIC');
  
  if (balance === 0n) {
    console.log('❌ No MATIC found! Get testnet MATIC from: https://faucet.polygon.technology/');
    console.log('Add this address to your wallet:', deployer.address);
  } else if (parseFloat(balanceInMatic) < 0.1) {
    console.log('⚠️  Low balance. Consider getting more MATIC for multiple deployments.');
  } else {
    console.log('✅ Sufficient balance for deployment');
  }
  
  // Check network connection
  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log('Current block number:', blockNumber);
    console.log('✅ Network connection successful');
  } catch (error) {
    console.log('❌ Network connection failed:', error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
