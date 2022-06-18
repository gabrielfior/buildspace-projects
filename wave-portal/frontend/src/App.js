import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import ProgressBar from "./progressbar/ProgressBar";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("");
  const [percentage, setPercentage] = useState(0);
  const contractAddress = "0x83BE50BA9726AC059835Db3D6b16C5AfCFeFf0CF";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {

    try {
      // make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log('no metamask peeps');
      }
      else {
        console.log('We have ethereum object', ethereum);
      }

      // check if we are authorized to access user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('found auth account', account);
        setCurrentAccount(account);
      }
      else {
        console.log('No auth account found');
      }

    } catch (error) {
      console.log(error);
    };
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get metamask');
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setPercentage(0);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        setTotalWaves(count.toNumber());
        console.log('retrieved total wave count ', count.toNumber());

        // execute wave
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining ", waveTxn.hash);
        setPercentage(50);

        await waveTxn.wait();
        console.log("Mining ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        setPercentage(100);
        setTotalWaves(count.toNumber());
        console.log('retrieved total wave count ', count.toNumber());

      }
      else {
        console.log('no ethereum object')
      }
    } catch (error) {
      console.log(error);
    };
  };

  const nextStep = () => {
    if (percentage === 100) {
      return;
    }
    setPercentage(percentage + 20);
  }


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div>
          <h2> Waving Progress </h2>
          <ProgressBar percentage={percentage} />
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>Connect Wallet</button>
        )}

      </div>
    </div>
  );
}
