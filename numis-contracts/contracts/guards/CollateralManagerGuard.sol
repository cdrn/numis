// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract CollateralManagerGuard is BaseGuard {
    address public owner;
    mapping(address => bool) public managers;
    mapping(address => bool) public whitelistedContracts;

    event ManagerAdded(address indexed manager);
    event ManagerRemoved(address indexed manager);
    event ContractWhitelisted(address indexed contractAddress);
    event ContractRemovedFromWhitelist(address indexed contractAddress);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "CollateralManagerGuard: caller is not the owner"
        );
        _;
    }

    constructor(
        address[] memory initialManagers,
        address[] memory initialContracts
    ) {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);

        for (uint256 i = 0; i < initialManagers.length; i++) {
            require(
                initialManagers[i] != address(0),
                "CollateralManagerGuard: cannot add zero address as manager"
            );
            managers[initialManagers[i]] = true;
            emit ManagerAdded(initialManagers[i]);
        }

        for (uint256 i = 0; i < initialContracts.length; i++) {
            require(
                initialContracts[i] != address(0),
                "CollateralManagerGuard: cannot whitelist zero address"
            );
            whitelistedContracts[initialContracts[i]] = true;
            emit ContractWhitelisted(initialContracts[i]);
        }
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(
            newOwner != address(0),
            "CollateralManagerGuard: new owner is the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function addManager(address manager) external onlyOwner {
        require(
            manager != address(0),
            "CollateralManagerGuard: cannot add zero address as manager"
        );
        require(
            !managers[manager],
            "CollateralManagerGuard: address is already a manager"
        );
        managers[manager] = true;
        emit ManagerAdded(manager);
    }

    function removeManager(address manager) external onlyOwner {
        require(
            managers[manager],
            "CollateralManagerGuard: address is not a manager"
        );
        managers[manager] = false;
        emit ManagerRemoved(manager);
    }

    function whitelistContract(address contractAddress) external onlyOwner {
        require(
            contractAddress != address(0),
            "CollateralManagerGuard: cannot whitelist zero address"
        );
        require(
            !whitelistedContracts[contractAddress],
            "CollateralManagerGuard: contract already whitelisted"
        );
        whitelistedContracts[contractAddress] = true;
        emit ContractWhitelisted(contractAddress);
    }

    function removeContractFromWhitelist(
        address contractAddress
    ) external onlyOwner {
        require(
            whitelistedContracts[contractAddress],
            "CollateralManagerGuard: contract not whitelisted"
        );
        whitelistedContracts[contractAddress] = false;
        emit ContractRemovedFromWhitelist(contractAddress);
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
        address msgSender
    ) external view override {
        require(
            managers[msgSender],
            "CollateralManagerGuard: caller is not a manager"
        );
        require(
            whitelistedContracts[to],
            "CollateralManagerGuard: target contract not whitelisted"
        );
    }

    function checkAfterExecution(bytes32, bool) external view override {}
}
