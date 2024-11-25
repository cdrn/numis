import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";
import {
  deployGuardFixture,
  mockSafeTx,
  expectRevert,
} from "./GuardTestHelper";

describe("CollateralManagerGuard", function () {
  async function deployCollateralManagerGuardFixture() {
    const initialManagers = [
      getAddress("0x1234567890123456789012345678901234567890"),
    ];
    const initialContracts = [
      getAddress("0x2234567890123456789012345678901234567890"),
    ];
    return deployGuardFixture("CollateralManagerGuard", [
      initialManagers,
      initialContracts,
    ]);
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { guard, deployer } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      const owner = await guard.read.owner();
      expect(getAddress(owner)).to.equal(getAddress(deployer.account.address));
    });

    it("Should set initial managers", async function () {
      const { guard } = await loadFixture(deployCollateralManagerGuardFixture);
      expect(
        await guard.read.managers([
          getAddress("0x1234567890123456789012345678901234567890"),
        ])
      ).to.be.true;
    });

    it("Should set initial whitelisted contracts", async function () {
      const { guard } = await loadFixture(deployCollateralManagerGuardFixture);
      expect(
        await guard.read.whitelistedContracts([
          getAddress("0x2234567890123456789012345678901234567890"),
        ])
      ).to.be.true;
    });

    it("Should not allow zero address in initial managers", async function () {
      await expectRevert(
        deployGuardFixture("CollateralManagerGuard", [
          [getAddress("0x0000000000000000000000000000000000000000")],
          [],
        ]),
        "CollateralManagerGuard: cannot add zero address as manager"
      );
    });

    it("Should not allow zero address in initial contracts", async function () {
      await expectRevert(
        deployGuardFixture("CollateralManagerGuard", [
          [],
          [getAddress("0x0000000000000000000000000000000000000000")],
        ]),
        "CollateralManagerGuard: cannot whitelist zero address"
      );
    });
  });

  describe("Owner Management", function () {
    it("Should allow owner to transfer ownership", async function () {
      const { guard, deployer, user1 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await guard.write.transferOwnership([user1.account.address], {
        account: deployer.account,
      });
      const newOwner = await guard.read.owner();
      expect(getAddress(newOwner)).to.equal(getAddress(user1.account.address));
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      const { guard, user1, user2 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await expectRevert(
        guard.write.transferOwnership([user2.account.address], {
          account: user1.account,
        }),
        "CollateralManagerGuard: caller is not the owner"
      );
    });

    it("Should not allow transfer ownership to zero address", async function () {
      const { guard, deployer } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await expectRevert(
        guard.write.transferOwnership(
          [getAddress("0x0000000000000000000000000000000000000000")],
          { account: deployer.account }
        ),
        "CollateralManagerGuard: new owner is the zero address"
      );
    });
  });

  describe("Manager Management", function () {
    it("Should allow owner to add manager", async function () {
      const { guard, deployer, user1 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await guard.write.addManager([user1.account.address], {
        account: deployer.account,
      });
      expect(await guard.read.managers([user1.account.address])).to.be.true;
    });

    it("Should not allow non-owner to add manager", async function () {
      const { guard, user1, user2 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await expectRevert(
        guard.write.addManager([user2.account.address], {
          account: user1.account,
        }),
        "CollateralManagerGuard: caller is not the owner"
      );
    });

    it("Should allow owner to remove manager", async function () {
      const { guard, deployer } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await guard.write.removeManager(
        [getAddress("0x1234567890123456789012345678901234567890")],
        { account: deployer.account }
      );
      expect(
        await guard.read.managers([
          getAddress("0x1234567890123456789012345678901234567890"),
        ])
      ).to.be.false;
    });

    it("Should not allow non-owner to remove manager", async function () {
      const { guard, user1 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await expectRevert(
        guard.write.removeManager(
          [getAddress("0x1234567890123456789012345678901234567890")],
          { account: user1.account }
        ),
        "CollateralManagerGuard: caller is not the owner"
      );
    });
  });

  describe("Contract Whitelisting", function () {
    it("Should allow owner to whitelist contract", async function () {
      const { guard, deployer, user1 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await guard.write.whitelistContract([user1.account.address], {
        account: deployer.account,
      });
      expect(await guard.read.whitelistedContracts([user1.account.address])).to
        .be.true;
    });

    it("Should not allow non-owner to whitelist contract", async function () {
      const { guard, user1, user2 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await expectRevert(
        guard.write.whitelistContract([user2.account.address], {
          account: user1.account,
        }),
        "CollateralManagerGuard: caller is not the owner"
      );
    });

    it("Should allow owner to remove contract from whitelist", async function () {
      const { guard, deployer } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await guard.write.removeContractFromWhitelist(
        [getAddress("0x2234567890123456789012345678901234567890")],
        { account: deployer.account }
      );
      expect(
        await guard.read.whitelistedContracts([
          getAddress("0x2234567890123456789012345678901234567890"),
        ])
      ).to.be.false;
    });

    it("Should not allow non-owner to remove contract from whitelist", async function () {
      const { guard, user1 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      await expectRevert(
        guard.write.removeContractFromWhitelist(
          [getAddress("0x2234567890123456789012345678901234567890")],
          { account: user1.account }
        ),
        "CollateralManagerGuard: caller is not the owner"
      );
    });
  });

  describe("Transaction Checking", function () {
    it("Should allow transactions from manager to whitelisted contract", async function () {
      const { guard } = await loadFixture(deployCollateralManagerGuardFixture);
      const tx = {
        ...mockSafeTx,
        to: getAddress("0x2234567890123456789012345678901234567890"),
        msgSender: getAddress("0x1234567890123456789012345678901234567890"),
      };

      await expect(
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
          tx.msgSender,
        ])
      ).to.not.be.rejected;
    });

    it("Should revert transactions from non-manager", async function () {
      const { guard, user1 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      const tx = {
        ...mockSafeTx,
        to: getAddress("0x2234567890123456789012345678901234567890"),
        msgSender: user1.account.address,
      };

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
          tx.msgSender,
        ]),
        "CollateralManagerGuard: caller is not a manager"
      );
    });

    it("Should revert transactions to non-whitelisted contract", async function () {
      const { guard, user1 } = await loadFixture(
        deployCollateralManagerGuardFixture
      );
      const tx = {
        ...mockSafeTx,
        to: user1.account.address,
        msgSender: getAddress("0x1234567890123456789012345678901234567890"),
      };

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
          tx.msgSender,
        ]),
        "CollateralManagerGuard: target contract not whitelisted"
      );
    });
  });
});
