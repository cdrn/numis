// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/interfaces/IGuard.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract WhitelistGuard is IGuard {
    mapping(address => bool) public whitelisted;

    constructor(address[] memory initialWhitelist) {
        for (uint256 i = 0; i < initialWhitelist.length; i++) {
            whitelisted[initialWhitelist[i]] = true;
        }
    }

    function addToWhitelist(address account) external {
        whitelisted[account] = true;
    }

    function removeFromWhitelist(address account) external {
        whitelisted[account] = false;
    }

    function checkTransaction(
        address to,
        uint256,
        bytes memory,
        Enum.Operation,
        uint256,
        uint256,
        uint256,
        address,
        address,
        bytes memory,
        address
    ) external override {
        require(whitelisted[to], "Recipient is not whitelisted");
    }

    function checkAfterExecution(bytes32, bool) external override {}
}
