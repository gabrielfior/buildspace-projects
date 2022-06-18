// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    mapping(address => uint256) public balances;
    address[] addresses;
    uint256 public totalWaves;
    Wave[] waves;

    event NewWave(address indexed from, uint256 timestamp, string message);

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function wave(string memory _message) public {
        totalWaves += 1;
        balances[msg.sender] += 1;
        addresses.push(msg.sender);
        console.log("%s waved w/ message %s", msg.sender, _message);
        console.log("balance for sender is %d", balances[msg.sender]);

        waves.push(Wave(msg.sender, _message, block.timestamp));
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("we have %d total waves", totalWaves);
        return totalWaves;
    }

    function getAddresses() public view returns (address[] memory) {
        return addresses;
    }

    function getUserWaves()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        address[] memory mAddresses = new address[](addresses.length);
        uint256[] memory mWaves = new uint256[](addresses.length);

        for (uint256 i = 0; i < addresses.length; i++) {
            mAddresses[i] = addresses[i];
            mWaves[i] = balances[addresses[i]];
        }
        return (mAddresses, mWaves);
    }
}
