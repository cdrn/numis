// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/interfaces/IGuard.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract CollateralManagerGuard is IGuard {
    mapping(address => bool) public managers;

    constructor(address[] memory initialManagers) {
        for (uint256 i = 0; i < initialManagers.length; i++) {
            managers[initialManagers[i]] = true;
        }
    }

    function addManager(address manager) external {
        managers[manager] = true;
    }

    function removeManager(address manager) external {
        managers[manager] = false;
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
        require(managers[msgSender], "Not a collateral manager");
        // optionally check the `to` address is a known collateral-related contract
    }

    function checkAfterExecution(bytes32, bool) external override {}
}
