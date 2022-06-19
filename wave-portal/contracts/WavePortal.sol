// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.,
        bool waverWonPrize; // waver won prize
    }

    mapping(address => uint256) public balances;
    address[] addresses;
    uint256 public totalWaves;
    Wave[] waves;
    uint256 private seed; // for randomness
    uint256 cooldown_in_sec;
    mapping(address => uint256) public lastWavedAt;

    event NewWave(address indexed from, uint256 timestamp, string message, bool waverWonPrize);

    constructor(uint256 cooldown_sec) payable {
        console.log("Contract has been constructed");
        cooldown_in_sec = cooldown_sec;
        updateSeed();
    }

    function updateSeed() private {
        seed = (block.difficulty + block.timestamp + seed) % 100;
    }

    function wave(string memory _message) public {

        // cooldown of 15min - check when user last waved
        require(
            lastWavedAt[msg.sender] + (cooldown_in_sec * 1 seconds) < block.timestamp,
            "Wait 15 min"
        );
        // update timestamp for user
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        balances[msg.sender] += 1;
        addresses.push(msg.sender);
        console.log("%s waved w/ message %s", msg.sender, _message);
        console.log("balance for sender is %d", balances[msg.sender]);
        
        bool waverWonPrize = false;

        // new seed
        updateSeed();
        console.log("Random # generated: %d", seed);

        if (seed < 50) {
            console.log("%s won", msg.sender);
            waverWonPrize = true;
            // definining prize money
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Not enough eth in contract for paying out prize"
            );
            (bool success, bytes memory data) = (msg.sender).call{
                value: prizeAmount
            }("");
            require(success, "Failed to withdraw money from contract");
        }

        waves.push(Wave(msg.sender, _message, block.timestamp, waverWonPrize));
        emit NewWave(msg.sender, block.timestamp, _message, waverWonPrize);
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
