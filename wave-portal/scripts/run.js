
const hre = require("hardhat");

const printBalance = async (contract) => {
  // contract balance
  let contractBalance = await hre.ethers.provider.getBalance(contract.address);
  console.log("contract balance (ETH): ", hre.ethers.utils.formatEther(contractBalance));
};

const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy(30,{
    value: hre.ethers.utils.parseEther("0.1"),
  });

  await waveContract.deployed(); // deployed by default by owner

  // tenderly not used locally
  /*
  await hre.tenderly.persistArtifacts({
    name: "WavePortal",
    address: waveContract.address,
  });
  */

  console.log('wave portal deployed to', waveContract.address);
  console.log("Contract deployed by:", owner.address);

  // contract balance
  await printBalance(waveContract);

  // call wave
  let waveCount = await waveContract.getTotalWaves();
  console.log('wave count', waveCount);

  let waveTxn = await waveContract.connect(randomPerson).wave("A message");
  //let waveTxn = await waveContract.wave();
  await waveTxn.wait();
  console.log('tx', waveTxn);

  // contract balance should have been updated
  await printBalance(waveContract);

  waveCount = await waveContract.getTotalWaves();
  console.log('new wave count', waveCount);

  console.log('address array', await waveContract.getAddresses());

  const result = await waveContract.getUserWaves();
  //const {0: variable_1, 1: variable_2} = result;
  console.log('wave mapping', result);

  /*
   * Let's try two waves now
   */
  const waveTxn1 = await waveContract.wave("This is wave #1");
  await waveTxn1.wait();
  console.log('after wave 1');
  await printBalance(waveContract);

  // cannot wave twice due to cooldown
  try {
    const waveTxn2 = await waveContract.wave("This is wave #2");
    await waveTxn2.wait();
  
    console.log('after wave 2');
    await printBalance(waveContract);
    
  } catch (error) {
    console.log("Error expected due to cooldown, continuing...");
  }
  
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