const { ethers, network, run } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log(`Deploying to network: ${network.name}`);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'MATIC');
  
  if (balance === 0n) {
    throw new Error('Deployer account has no MATIC. Please fund your account with Mumbai testnet MATIC.');
  }

  const CertificateRegistry = await ethers.getContractFactory('CertificateRegistry');
  
  // Deploy with proper gas settings for Mumbai
  const feeData = await ethers.provider.getFeeData();
  const registry = await CertificateRegistry.deploy({
    gasLimit: 500000,
    gasPrice: feeData.gasPrice
  });

  // Wait for deployment
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  console.log('CertificateRegistry deployed to:', address);

  // Save deployment info
  const outDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const artifact = { 
    network: network.name, 
    address, 
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    txHash: registry.deploymentTransaction().hash
  };
  fs.writeFileSync(path.join(outDir, `${network.name}.json`), JSON.stringify(artifact, null, 2));

  // Verify on Polygonscan for Mumbai
  if (network.name === 'mumbai' && process.env.POLYGONSCAN_API_KEY) {
    console.log('Waiting 5 blocks before verification...');
    await registry.deploymentTransaction().wait(5);
    try {
      await run('verify:verify', { address, constructorArguments: [] });
      console.log('Contract verified on Polygonscan');
    } catch (err) {
      console.log('Verification skipped/failed:', err.message || err);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


