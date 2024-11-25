import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  getAddress,
  Address,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  toHex,
} from "viem";
import {
  deployGuardFixture,
  mockSafeTx,
  expectRevert,
} from "./GuardTestHelper";

describe("TimelockGuard", function () {
  const ONE_DAY = 24n * 60n * 60n; // 1 day in seconds

  async function deployTimelockGuardFixture() {
    return deployGuardFixture("TimelockGuard", [ONE_DAY]);
  }

  function calculateTxHash(tx: typeof mockSafeTx) {
    const dataHash = keccak256(tx.data as `0x${string}`);
    return keccak256(
      encodeAbiParameters(parseAbiParameters("address,uint256,bytes32,uint8"), [
        tx.to,
        tx.value,
        dataHash,
        Number(tx.operation),
      ])
    );
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { guard, deployer } = await loadFixture(deployTimelockGuardFixture);
      const owner = (await guard.read.owner()) as Address;
      expect(getAddress(owner)).to.equal(getAddress(deployer.account.address));
    });

    it("Should set the correct timelock duration", async function () {
      const { guard } = await loadFixture(deployTimelockGuardFixture);
      expect(await guard.read.timeLockDuration()).to.equal(ONE_DAY);
    });

    it("Should not allow zero timelock duration", async function () {
      await expectRevert(
        deployGuardFixture("TimelockGuard", [0n]),
        "TimelockGuard: duration must be > 0"
      );
    });
  });

  describe("Transaction Scheduling", function () {
    it("Should allow owner to schedule transactions", async function () {
      const { guard, deployer } = await loadFixture(deployTimelockGuardFixture);
      const currentTime = await time.latest();
      await time.setNextBlockTimestamp(currentTime);

      await guard.write.scheduleTransaction(
        [
          mockSafeTx.to,
          mockSafeTx.value,
          mockSafeTx.data,
          mockSafeTx.operation,
        ],
        { account: deployer.account }
      );

      const txHash = calculateTxHash(mockSafeTx);
      const scheduledTime = await guard.read.scheduledTransactions([txHash]);
      expect(scheduledTime).to.equal(BigInt(currentTime) + ONE_DAY);
    });

    it("Should not allow non-owner to schedule transactions", async function () {
      const { guard, user1 } = await loadFixture(deployTimelockGuardFixture);
      await expectRevert(
        guard.write.scheduleTransaction(
          [
            mockSafeTx.to,
            mockSafeTx.value,
            mockSafeTx.data,
            mockSafeTx.operation,
          ],
          { account: user1.account }
        ),
        "TimelockGuard: caller is not the owner"
      );
    });

    it("Should not allow scheduling same transaction twice", async function () {
      const { guard, deployer } = await loadFixture(deployTimelockGuardFixture);
      await guard.write.scheduleTransaction(
        [
          mockSafeTx.to,
          mockSafeTx.value,
          mockSafeTx.data,
          mockSafeTx.operation,
        ],
        { account: deployer.account }
      );

      await expectRevert(
        guard.write.scheduleTransaction(
          [
            mockSafeTx.to,
            mockSafeTx.value,
            mockSafeTx.data,
            mockSafeTx.operation,
          ],
          { account: deployer.account }
        ),
        "TimelockGuard: transaction already scheduled"
      );
    });
  });

  describe("Transaction Checking", function () {
    it("Should revert if transaction is not scheduled", async function () {
      const { guard } = await loadFixture(deployTimelockGuardFixture);
      await expectRevert(
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
        ]),
        "TimelockGuard: transaction not scheduled"
      );
    });

    it("Should revert if timelock period has not ended", async function () {
      const { guard, deployer } = await loadFixture(deployTimelockGuardFixture);
      const currentTime = await time.latest();
      await time.setNextBlockTimestamp(currentTime);

      await guard.write.scheduleTransaction(
        [
          mockSafeTx.to,
          mockSafeTx.value,
          mockSafeTx.data,
          mockSafeTx.operation,
        ],
        { account: deployer.account }
      );

      await expectRevert(
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
        ]),
        "TimelockGuard: timelock period not ended"
      );
    });

    it("Should allow transaction after timelock period", async function () {
      const { guard, deployer } = await loadFixture(deployTimelockGuardFixture);
      const currentTime = await time.latest();
      await time.setNextBlockTimestamp(currentTime);

      await guard.write.scheduleTransaction(
        [
          mockSafeTx.to,
          mockSafeTx.value,
          mockSafeTx.data,
          mockSafeTx.operation,
        ],
        { account: deployer.account }
      );

      // Increase time by more than the timelock duration
      await time.increase(Number(ONE_DAY) + 1);

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
  });

  describe("Timelock Duration Management", function () {
    it("Should allow owner to update timelock duration", async function () {
      const { guard, deployer } = await loadFixture(deployTimelockGuardFixture);
      const newDuration = 2n * ONE_DAY;
      await guard.write.updateTimelockDuration([newDuration], {
        account: deployer.account,
      });
      expect(await guard.read.timeLockDuration()).to.equal(newDuration);
    });

    it("Should not allow non-owner to update timelock duration", async function () {
      const { guard, user1 } = await loadFixture(deployTimelockGuardFixture);
      await expectRevert(
        guard.write.updateTimelockDuration([2n * ONE_DAY], {
          account: user1.account,
        }),
        "TimelockGuard: caller is not the owner"
      );
    });

    it("Should not allow zero timelock duration", async function () {
      const { guard, deployer } = await loadFixture(deployTimelockGuardFixture);
      await expectRevert(
        guard.write.updateTimelockDuration([0n], { account: deployer.account }),
        "TimelockGuard: duration must be > 0"
      );
    });
  });
});
