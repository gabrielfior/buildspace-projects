import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import ProgressBar from "./progressbar/ProgressBar";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import WavePortalArtifact from "./contracts/WavePortal.json";
import contractAddress from "./contracts/contract-address.json";

const Item = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const getAllWaves = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        let wavePortalContract = getWaveContract();
        const waves = await wavePortalContract.getAllWaves();


        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });


        setAllWaves(wavesCleaned);

      }
      else {
        console.log('no metamask peeps2');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {


    try {
      // make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log('no metamask peeps');
      }

      // check if we are authorized to access user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];

        setCurrentAccount(account);
        await getAllWaves();
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

  const getWaveContract = () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const wavePortalContract = new ethers.Contract(
      contractAddress.WavePortal,
      WavePortalArtifact.abi,
      signer
    );

    return wavePortalContract;
  };

  const getTotalWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setPercentage(0);
        const wavePortalContract = getWaveContract();

        let count = await wavePortalContract.getTotalWaves();
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

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {

        const wavePortalContract = getWaveContract();

        // execute wave
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining ", waveTxn.hash);
        setPercentage(50);

        await waveTxn.wait();
        console.log("Mining ", waveTxn.hash);

        await getTotalWaves();
        setMessage("");

      }
      else {
        console.log('no ethereum object')
      }
    } catch (error) {
      toast.error("Error occured, check console");
      console.log(error);
    };
  };

  // listen for emitter events
  useEffect(() => {

    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('entered new wave');
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message
        },
      ]);
    };

    if (window.ethereum){
      wavePortalContract = getWaveContract();
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract){
        wavePortalContract.off("NewWave", onNewWave);
      }
    };

  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const getCardsList = () => {
    let cardList = [];
    allWaves.map((wave, index) => {

      cardList.push(
        <Grid item key={index}>
          <Item>
            <Card>
              <CardHeader
                title={"Wave " + (index + 1)}
              />
              <CardContent>
                <Typography
                  className={"MuiTypography--heading"}
                  variant={"h6"}
                >
                  {wave.address}
                </Typography>
                <Typography
                  variant={"subtitle1"}
                >
                  {wave.message}
                </Typography>
                <Typography
                  variant={"string"}
                >
                  {wave.timestamp.toString()}
                </Typography>
              </CardContent>
            </Card>
          </Item>

        </Grid>

      )
    });
    return cardList;
  };


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

        <h2>{totalWaves} waves collected so far!</h2>

        <TextField id="outlined-basic" label="Message to wave" variant="outlined" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button style={{ marginTop: "10px" }} variant="contained" onClick={wave}>Wave at me</Button>


        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>Connect Wallet</button>
        )}



        <div>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              {getCardsList()}
            </Grid>
          </Box>
        </div>

      </div>

      <Toaster />
    </div>

  );
}
