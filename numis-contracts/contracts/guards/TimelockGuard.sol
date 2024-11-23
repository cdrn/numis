// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/interfaces/IGuard.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract TimeLockGuard is IGuard {
    uint256 public timeLockDuration;
    mapping(bytes32 => uint256) public scheduledTransactions;

    constructor(uint256 _timeLockDuration) {
        timeLockDuration = _timeLockDuration;
    }

    function scheduleTransaction(bytes32 txHash) external {
        scheduledTransactions[txHash] = block.timestamp + timeLockDuration;
    }

    function checkTransaction(
        address,
        uint256,
        bytes memory,
        Enum.Operation,
        uint256,
        uint256,
        uint256,
        address,
        address,
        bytes memory signatures,
        address
    ) external override {
        bytes32 txHash = keccak256(signatures); // or however you're hashing the tx
        require(
            block.timestamp >= scheduledTransactions[txHash],
            "Transaction is timelocked"
        );
    }

    function checkAfterExecution(bytes32 txHash, bool) external override {
        delete scheduledTransactions[txHash];
    }
}
