// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract WithdrawalLimitGuard is BaseGuard {
    uint256 public dailyLimit;
    mapping(address => uint256) public spentToday;
    mapping(address => uint256) public lastSpentTimestamp;

    constructor(uint256 _dailyLimit) {
        dailyLimit = _dailyLimit;
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external override {
        uint256 today = block.timestamp / 1 days;
        if (lastSpentTimestamp[msgSender] < today) {
            spentToday[msgSender] = 0; // reset daily limit
            lastSpentTimestamp[msgSender] = today;
        }
        require(
            spentToday[msgSender] + value <= dailyLimit,
            "Daily limit exceeded"
        );
        spentToday[msgSender] += value;
    }

    function checkAfterExecution(
        bytes32 txHash,
        bool success
    ) external override {
        // Add any post-execution checks if needed, or leave empty
    }
}
