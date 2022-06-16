// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    mapping(address => uint256) public balances;
    address[] addresses;
    uint256 public totalWaves;

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function wave() public {
        totalWaves += 1;
        balances[msg.sender] += 1;
        addresses.push(msg.sender);
        console.log("%s has waved", msg.sender);
        console.log("balance for sender is %d", balances[msg.sender]);
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
