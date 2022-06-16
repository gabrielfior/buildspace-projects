const { hexStripZeros } = require("ethers/lib/utils");

const {ethers} = require("hardhat");

const main = async () => {
    const waveContractFactory = await ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy();

    await waveContract.deployed();

    console.log('wave portal deployed to', waveContract.address);
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