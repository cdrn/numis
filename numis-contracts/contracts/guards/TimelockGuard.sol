// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract TimelockGuard is BaseGuard {
    uint256 public timeLockDuration;
    address public owner;

    // Mapping from transaction hash to timestamp when it can be executed
    mapping(bytes32 => uint256) public scheduledTransactions;

    event TransactionScheduled(bytes32 indexed txHash, uint256 executionTime);
    event TimelockDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "TimelockGuard: caller is not the owner");
        _;
    }

    constructor(uint256 _timeLockDuration) {
        require(_timeLockDuration > 0, "TimelockGuard: duration must be > 0");
        timeLockDuration = _timeLockDuration;
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
        emit TimelockDurationUpdated(0, _timeLockDuration);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(
            newOwner != address(0),
            "TimelockGuard: new owner is the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function updateTimelockDuration(uint256 newDuration) external onlyOwner {
        require(newDuration > 0, "TimelockGuard: duration must be > 0");
        emit TimelockDurationUpdated(timeLockDuration, newDuration);
        timeLockDuration = newDuration;
    }

    function scheduleTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) external onlyOwner {
        bytes32 txHash = keccak256(
            abi.encode(to, value, keccak256(data), operation)
        );
        require(
            scheduledTransactions[txHash] == 0,
            "TimelockGuard: transaction already scheduled"
        );

        scheduledTransactions[txHash] = block.timestamp + timeLockDuration;
        emit TransactionScheduled(txHash, scheduledTransactions[txHash]);
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256,
        uint256,
        uint256,
        address,
        address payable,
        bytes memory,
        address
    ) external view override {
        bytes32 txHash = keccak256(
            abi.encode(to, value, keccak256(data), operation)
        );

        uint256 scheduledTime = scheduledTransactions[txHash];
        require(scheduledTime > 0, "TimelockGuard: transaction not scheduled");
        require(
            block.timestamp >= scheduledTime,
            "TimelockGuard: timelock period not ended"
        );
    }

    function checkAfterExecution(bytes32 txHash, bool) external override {
        // Clear the schedule after execution
        delete scheduledTransactions[txHash];
    }
}
