// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

/**
 * @title MetaGuard
 * @notice A composable guard that allows multiple guards to be used together on a Safe vault
 * @dev This contract implements the Guard interface and acts as a wrapper around multiple
 * other guard contracts. When a transaction is checked, it runs the checks through all registered
 * guards sequentially. This allows combining different guard functionalities.
 */
contract MetaGuard is BaseGuard {
    address public owner;
    Guard[] public guards;
    mapping(address => bool) public registeredGuards;

    event GuardAdded(address indexed guard);
    event GuardRemoved(address indexed guard);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "MetaGuard: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(
            newOwner != address(0),
            "MetaGuard: new owner is the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function addGuard(address guard) external onlyOwner {
        require(guard != address(0), "MetaGuard: guard is the zero address");
        require(
            !registeredGuards[guard],
            "MetaGuard: guard already registered"
        );
        require(
            Guard(guard).supportsInterface(type(Guard).interfaceId),
            "MetaGuard: invalid guard interface"
        );

        guards.push(Guard(guard));
        registeredGuards[guard] = true;
        emit GuardAdded(guard);
    }

    function removeGuard(uint256 index) external onlyOwner {
        require(index < guards.length, "MetaGuard: index out of bounds");
        address guardAddress = address(guards[index]);

        // Move the last guard to the removed position
        guards[index] = guards[guards.length - 1];
        guards.pop();
        registeredGuards[guardAddress] = false;

        emit GuardRemoved(guardAddress);
    }

    function getGuards() external view returns (Guard[] memory) {
        return guards;
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external override {
        for (uint256 i = 0; i < guards.length; i++) {
            guards[i].checkTransaction(
                to,
                value,
                data,
                operation,
                safeTxGas,
                baseGas,
                gasPrice,
                gasToken,
                refundReceiver,
                signatures,
                msgSender
            );
        }
    }

    function checkAfterExecution(
        bytes32 txHash,
        bool success
    ) external override {
        for (uint256 i = 0; i < guards.length; i++) {
            guards[i].checkAfterExecution(txHash, success);
        }
    }
}
