
const hre = require("hardhat");

const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy();

  await waveContract.deployed(); // deployed by default by owner

  await hre.tenderly.persistArtifacts({
    name: "WavePortal",
    address: waveContract.address,
  });

  console.log('wave portal deployed to', waveContract.address);
  console.log("Contract deployed by:", owner.address);

  // call wave
  let waveCount = await waveContract.getTotalWaves();
  console.log('wave count', waveCount);

  let waveTxn = await waveContract.connect(randomPerson).wave("A message");
  //let waveTxn = await waveContract.wave();
  await waveTxn.wait();
  console.log('tx', waveTxn);

  waveCount = await waveContract.getTotalWaves();
  console.log('new wave count', waveCount);

  console.log('address array', await waveContract.getAddresses());

  const result = await waveContract.getUserWaves();
  //const {0: variable_1, 1: variable_2} = result;
  console.log('wave mapping', result);

  /**
   * Let's send a few waves!
   */
   waveTxn = await waveContract.wave("A message!");
   await waveTxn.wait(); // Wait for the transaction to be mined
 
   waveTxn = await waveContract.connect(randomPerson).wave("Another message!");
   await waveTxn.wait(); // Wait for the transaction to be mined
 
   let allWaves = await waveContract.getAllWaves();
   console.log(allWaves);
};

const runMain = () => {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

runMain();