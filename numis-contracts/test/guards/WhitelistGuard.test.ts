import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, Address } from "viem";
import {
  deployGuardFixture,
  mockSafeTx,
  expectRevert,
} from "./GuardTestHelper";

describe("WhitelistGuard", function () {
  async function deployWhitelistGuardFixture() {
    const initialWhitelist = [
      getAddress("0x1234567890123456789012345678901234567890"),
    ];
    return deployGuardFixture("WhitelistGuard", [initialWhitelist]);
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { guard, deployer } = await loadFixture(
        deployWhitelistGuardFixture
      );
      const owner = (await guard.read.owner()) as Address;
      expect(getAddress(owner)).to.equal(getAddress(deployer.account.address));
    });

    it("Should whitelist initial addresses", async function () {
      const { guard } = await loadFixture(deployWhitelistGuardFixture);
      expect(
        await guard.read.whitelisted([
          getAddress("0x1234567890123456789012345678901234567890"),
        ])
      ).to.be.true;
    });

    it("Should not allow zero address in initial whitelist", async function () {
      await expectRevert(
        deployGuardFixture("WhitelistGuard", [
          [getAddress("0x0000000000000000000000000000000000000000")],
        ]),
        "WhitelistGuard: cannot whitelist zero address"
      );
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to add to whitelist", async function () {
      const { guard, deployer, user1 } = await loadFixture(
        deployWhitelistGuardFixture
      );
      await guard.write.addToWhitelist([user1.account.address], {
        account: deployer.account,
      });
      expect(await guard.read.whitelisted([user1.account.address])).to.be.true;
    });

    it("Should not allow non-owner to add to whitelist", async function () {
      const { guard, user1, user2 } = await loadFixture(
        deployWhitelistGuardFixture
      );
      await expectRevert(
        guard.write.addToWhitelist([user2.account.address], {
          account: user1.account,
        }),
        "WhitelistGuard: caller is not the owner"
      );
    });

    it("Should allow owner to remove from whitelist", async function () {
      const { guard, deployer } = await loadFixture(
        deployWhitelistGuardFixture
      );
      await guard.write.removeFromWhitelist(
        [getAddress("0x1234567890123456789012345678901234567890")],
        { account: deployer.account }
      );
      expect(
        await guard.read.whitelisted([
          getAddress("0x1234567890123456789012345678901234567890"),
        ])
      ).to.be.false;
    });

    it("Should not allow non-owner to remove from whitelist", async function () {
      const { guard, user1 } = await loadFixture(deployWhitelistGuardFixture);
      await expectRevert(
        guard.write.removeFromWhitelist(
          [getAddress("0x1234567890123456789012345678901234567890")],
          { account: user1.account }
        ),
        "WhitelistGuard: caller is not the owner"
      );
    });
  });

  describe("Transaction Checking", function () {
    it("Should allow transactions to whitelisted addresses", async function () {
      const { guard } = await loadFixture(deployWhitelistGuardFixture);
      await expect(
        guard.read.checkTransaction([
          mockSafeTx.to,
          mockSafeTx.value,
          mockSafeTx.data,
          mockSafeTx.operation,
          mockSafeTx.safeTxGas,
          mockSafeTx.baseGas,
          mockSafeTx.gasPrice,
          mockSafeTx.gasToken,
          mockSafeTx.refundReceiver,
          mockSafeTx.signatures,
          mockSafeTx.to,
        ])
      ).to.not.be.rejected;
    });

    it("Should revert transactions to non-whitelisted addresses", async function () {
      const { guard, user1 } = await loadFixture(deployWhitelistGuardFixture);
      const tx = { ...mockSafeTx, to: user1.account.address };
      await expectRevert(
        guard.read.checkTransaction([
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
          tx.to,
        ]),
        "WhitelistGuard: recipient not whitelisted"
      );
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      const { guard, deployer, user1 } = await loadFixture(
        deployWhitelistGuardFixture
      );
      await guard.write.transferOwnership([user1.account.address], {
        account: deployer.account,
      });
      const owner = (await guard.read.owner()) as Address;
      expect(getAddress(owner)).to.equal(getAddress(user1.account.address));
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      const { guard, user1, user2 } = await loadFixture(
        deployWhitelistGuardFixture
      );
      await expectRevert(
        guard.write.transferOwnership([user2.account.address], {
          account: user1.account,
        }),
        "WhitelistGuard: caller is not the owner"
      );
    });

    it("Should not allow transfer ownership to zero address", async function () {
      const { guard, deployer } = await loadFixture(
        deployWhitelistGuardFixture
      );
      await expectRevert(
        guard.write.transferOwnership(
          [getAddress("0x0000000000000000000000000000000000000000")],
          { account: deployer.account }
        ),
        "WhitelistGuard: new owner is the zero address"
      );
    });
  });
});
