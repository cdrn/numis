import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import "@nomicfoundation/hardhat-viem";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";
import {
  deployGuardFixture,
  mockSafeTx,
  expectRevert,
} from "./GuardTestHelper";

describe("MetaGuard", function () {
  async function deployMetaGuardFixture() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    // Deploy MetaGuard
    const metaGuard = await hre.viem.deployContract("MetaGuard", []);

    // Deploy some test guards to add
    const whitelistGuard = await hre.viem.deployContract("WhitelistGuard", [
      [],
    ]);
    const timelockGuard = await hre.viem.deployContract("TimelockGuard", [
      3600n,
    ]); // 1 hour timelock
    const collateralGuard = await hre.viem.deployContract(
      "CollateralManagerGuard",
      [[], []]
    );

    const publicClient = await hre.viem.getPublicClient();

    return {
      metaGuard,
      whitelistGuard,
      timelockGuard,
      collateralGuard,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Guard Management", function () {
    it("Should successfully add a guard", async function () {
      const { metaGuard, whitelistGuard, owner } = await loadFixture(
        deployMetaGuardFixture
      );

      await metaGuard.write.addGuard([whitelistGuard.address]);

      const firstGuard = await metaGuard.read.guards([0n]);
      expect(firstGuard).to.equal(getAddress(whitelistGuard.address));
    });

    it("Should successfully remove a guard", async function () {
      const { metaGuard, whitelistGuard, timelockGuard, owner } =
        await loadFixture(deployMetaGuardFixture);

      await metaGuard.write.addGuard([whitelistGuard.address]);
      await metaGuard.write.addGuard([timelockGuard.address]);

      await metaGuard.write.removeGuard([0n]);

      const remainingGuard = await metaGuard.read.guards([0n]);
      expect(remainingGuard).to.equal(getAddress(timelockGuard.address));
    });

    it("Should revert when trying to remove guard with invalid index", async function () {
      const { metaGuard } = await loadFixture(deployMetaGuardFixture);

      await expect(metaGuard.write.removeGuard([0n])).to.be.rejected;
    });
  });

  describe("Transaction Checking", function () {
    it("Should pass transaction check when no guards are added", async function () {
      const { metaGuard, owner, otherAccount } = await loadFixture(
        deployMetaGuardFixture
      );

      const tx = {
        to: otherAccount.account.address,
        value: 0n,
        data: "0x",
        operation: 0n, // Call
        safeTxGas: 0n,
        baseGas: 0n,
        gasPrice: 0n,
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        signatures: "0x",
        msgSender: owner.account.address,
      };

      await expect(
        metaGuard.write.checkTransaction([
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.safeTxGas,
          tx.baseGas,
          tx.gasPrice,
          tx.gasToken,
          tx.refundReceiver,
          tx.signatures,
          tx.msgSender,
        ])
      ).to.not.be.rejected;
    });

    it("Should enforce all guard checks when multiple guards are added", async function () {
      const {
        metaGuard,
        whitelistGuard,
        collateralGuard,
        owner,
        otherAccount,
      } = await loadFixture(deployMetaGuardFixture);

      // Add guards
      await metaGuard.write.addGuard([whitelistGuard.address], {
        account: owner.account,
      });
      await metaGuard.write.addGuard([collateralGuard.address], {
        account: owner.account,
      });

      const tx = {
        ...mockSafeTx,
        to: otherAccount.account.address,
        msgSender: owner.account.address,
      };

      // Should fail because recipient not whitelisted and sender not collateral manager
      await expectRevert(
        metaGuard.write.checkTransaction([
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.safeTxGas,
          tx.baseGas,
          tx.gasPrice,
          tx.gasToken,
          tx.refundReceiver,
          tx.signatures,
          tx.msgSender,
        ]),
        "WhitelistGuard: recipient not whitelisted"
      );

      // Whitelist the recipient
      await whitelistGuard.write.addToWhitelist(
        [otherAccount.account.address],
        { account: owner.account }
      );

      // Should still fail because sender not collateral manager
      await expectRevert(
        metaGuard.write.checkTransaction([
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.safeTxGas,
          tx.baseGas,
          tx.gasPrice,
          tx.gasToken,
          tx.refundReceiver,
          tx.signatures,
          tx.msgSender,
        ]),
        "CollateralManagerGuard: caller is not a manager"
      );

      // Add sender as collateral manager and whitelist the contract
      await collateralGuard.write.addManager([owner.account.address], {
        account: owner.account,
      });
      await collateralGuard.write.whitelistContract(
        [otherAccount.account.address],
        { account: owner.account }
      );

      // Should now pass all checks
      await expect(
        metaGuard.write.checkTransaction([
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.safeTxGas,
          tx.baseGas,
          tx.gasPrice,
          tx.gasToken,
          tx.refundReceiver,
          tx.signatures,
          tx.msgSender,
        ])
      ).to.not.be.rejected;
    });
  });

  describe("After Execution Checks", function () {
    it("Should call checkAfterExecution on all guards", async function () {
      const { metaGuard, timelockGuard, owner } = await loadFixture(
        deployMetaGuardFixture
      );

      await metaGuard.write.addGuard([timelockGuard.address]);

      const txHash =
        "0x1234567890123456789012345678901234567890123456789012345678901234";

      await expect(metaGuard.write.checkAfterExecution([txHash, true])).to.not
        .be.rejected;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty guard array correctly", async function () {
      const { metaGuard } = await loadFixture(deployMetaGuardFixture);

      const txHash =
        "0x1234567890123456789012345678901234567890123456789012345678901234";
      await expect(metaGuard.write.checkAfterExecution([txHash, true])).to.not
        .be.rejected;
    });

    it("Should maintain guard order after removals", async function () {
      const { metaGuard, whitelistGuard, timelockGuard, collateralGuard } =
        await loadFixture(deployMetaGuardFixture);

      await metaGuard.write.addGuard([whitelistGuard.address]);
      await metaGuard.write.addGuard([timelockGuard.address]);
      await metaGuard.write.addGuard([collateralGuard.address]);

      await metaGuard.write.removeGuard([1n]); // Remove timelock guard

      const firstGuard = await metaGuard.read.guards([0n]);
      const secondGuard = await metaGuard.read.guards([1n]);

      expect(firstGuard).to.equal(getAddress(whitelistGuard.address));
      expect(secondGuard).to.equal(getAddress(collateralGuard.address));
    });
  });
});
