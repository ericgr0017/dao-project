const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Copying contract ABIs to frontend...');
  
  // Define paths
  const contractsDir = path.join(__dirname, '../artifacts/contracts');
  const frontendDir = path.join(__dirname, '../../dao-frontend/src/contracts');
  
  // Create frontend directory if it doesn't exist
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  // Copy GovernanceToken ABI
  const governanceTokenPath = path.join(contractsDir, 'governance/Governance.sol/GovernanceToken.json');
  if (fs.existsSync(governanceTokenPath)) {
    fs.copyFileSync(governanceTokenPath, path.join(frontendDir, 'GovernanceToken.json'));
    console.log('Copied GovernanceToken ABI');
  } else {
    console.error('GovernanceToken ABI not found at:', governanceTokenPath);
    
    // Try to find the GovernanceToken ABI in other locations
    console.log('Searching for GovernanceToken ABI...');
    const artifactsDir = path.join(__dirname, '../artifacts');
    
    // Use a recursive function to find the file
    function findFile(dir, filename) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          const found = findFile(filePath, filename);
          if (found) return found;
        } else if (file === filename) {
          return filePath;
        }
      }
      
      return null;
    }
    
    const governanceTokenFile = findFile(artifactsDir, 'GovernanceToken.json');
    
    if (governanceTokenFile) {
      console.log('Found GovernanceToken ABI at:', governanceTokenFile);
      fs.copyFileSync(governanceTokenFile, path.join(frontendDir, 'GovernanceToken.json'));
      console.log('Copied GovernanceToken ABI');
    } else {
      console.error('GovernanceToken ABI not found anywhere in artifacts directory');
    }
  }
  
  // Copy Treasury ABI
  const treasuryPath = path.join(contractsDir, 'treasury/Treasury.sol/Treasury.json');
  if (fs.existsSync(treasuryPath)) {
    fs.copyFileSync(treasuryPath, path.join(frontendDir, 'Treasury.json'));
    console.log('Copied Treasury ABI');
  } else {
    console.error('Treasury ABI not found');
  }
  
  // Copy ProposalSystem ABI
  const proposalSystemPath = path.join(contractsDir, 'governance/ProposalSystem.sol/ProposalSystem.json');
  if (fs.existsSync(proposalSystemPath)) {
    fs.copyFileSync(proposalSystemPath, path.join(frontendDir, 'ProposalSystem.json'));
    console.log('Copied ProposalSystem ABI');
  } else {
    console.error('ProposalSystem ABI not found');
  }
  
  console.log('ABI copying complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 