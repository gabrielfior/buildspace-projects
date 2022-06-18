import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import ProgressBar from "./progressbar/ProgressBar";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

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
  const contractAddress = "0xE6E0b3C2ac94DEB8943d35B12ce9F3a0eE5B14C0";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    console.log('entered get all waves');

    try {
      const { ethereum } = window;

      if (ethereum) {
        let wavePortalContract = getWaveContract();
        console.log('oi');
        const waves = await wavePortalContract.getAllWaves();
        console.log('waves', waves);

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        console.log('wavesCleaned', wavesCleaned);
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
    console.log('entered check wallet');

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
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
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
        const waveTxn = await wavePortalContract.wave(message);
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
      console.log(error);
    };
  };


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [totalWaves, allWaves])

  useEffect(() => {
    getTotalWaves();
  },
    [totalWaves])

  const getCardsList = () => {
    let cardList = [];
    allWaves.map((wave, index) => {

      cardList.push(
        <Grid item>
          <Item>
            <Card>
              <CardHeader
                title={"Wave " + (index + 1)}
                actAsExpander={true}
                showExpandableButton={true}
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

    </div>

  );
}
