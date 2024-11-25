// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract WhitelistGuard is BaseGuard {
    address public owner;
    mapping(address => bool) public whitelisted;

    event AddressWhitelisted(address indexed account);
    event AddressRemovedFromWhitelist(address indexed account);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "WhitelistGuard: caller is not the owner");
        _;
    }

    constructor(address[] memory initialWhitelist) {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);

        for (uint256 i = 0; i < initialWhitelist.length; i++) {
            require(
                initialWhitelist[i] != address(0),
                "WhitelistGuard: cannot whitelist zero address"
            );
            whitelisted[initialWhitelist[i]] = true;
            emit AddressWhitelisted(initialWhitelist[i]);
        }
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(
            newOwner != address(0),
            "WhitelistGuard: new owner is the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function addToWhitelist(address account) external onlyOwner {
        require(
            account != address(0),
            "WhitelistGuard: cannot whitelist zero address"
        );
        require(
            !whitelisted[account],
            "WhitelistGuard: address already whitelisted"
        );
        whitelisted[account] = true;
        emit AddressWhitelisted(account);
    }

    function removeFromWhitelist(address account) external onlyOwner {
        require(
            whitelisted[account],
            "WhitelistGuard: address not whitelisted"
        );
        whitelisted[account] = false;
        emit AddressRemovedFromWhitelist(account);
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
        address payable,
        bytes memory,
        address
    ) external view override {
        require(whitelisted[to], "WhitelistGuard: recipient not whitelisted");
    }

    function checkAfterExecution(bytes32, bool) external view override {}
}
