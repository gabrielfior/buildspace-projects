
const  hre = require("hardhat");

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy(30, {
    value: hre.ethers.utils.parseEther("0.001"),
  });

  await waveContract.deployed();

  let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log("WavePortal balance: ", hre.ethers.utils.formatEther(contractBalance));
  console.log('wave portal deployed to', waveContract.address);
  
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(waveContract);

};

function saveFrontendFiles(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ WavePortal: contract.address }, undefined, 2)
  );

  const WavePortalArtifact = artifacts.readArtifactSync("WavePortal");

  fs.writeFileSync(
    contractsDir + "/WavePortal.json",
    JSON.stringify(WavePortalArtifact, null, 2)
  );
}

const runMain = () => {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

runMain();