// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

/**
 * @title MetaGuard
 * @notice A composable guard that allows multiple guards to be used together on a Safe vault
 * @dev This contract implements the IGuard interface and acts as a wrapper around multiple
 * other guard contracts. When a transaction is checked, it runs the checks through all registered
 * guards sequentially. This allows combining different guard functionalities (e.g., whitelist +
 * timelock + spending limits) into a single guard. Guards can be added and removed dynamically.
 */
contract MetaGuard is IGuard {
    IGuard[] public guards;

    function addGuard(address guard) external {
        guards.push(IGuard(guard));
    }

    function removeGuard(uint256 index) external {
        guards[index] = guards[guards.length - 1];
        guards.pop();
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
        address refundReceiver,
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
