import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";
import {
  deployGuardFixture,
  mockSafeTx,
  expectRevert,
} from "./GuardTestHelper";

describe("WithdrawalLimitGuard", function () {
  const DAILY_LIMIT = parseEther("1"); // 1 ETH daily limit

  async function deployWithdrawalLimitGuardFixture() {
    return deployGuardFixture("WithdrawalLimitGuard", [DAILY_LIMIT]);
  }

  describe("Deployment", function () {
    it("Should set the correct daily limit", async function () {
      const { guard } = await loadFixture(deployWithdrawalLimitGuardFixture);
      expect(await guard.read.dailyLimit()).to.equal(DAILY_LIMIT);
    });
  });

  describe("Transaction Checking", function () {
    it("Should allow transaction within daily limit", async function () {
      const { guard, user1 } = await loadFixture(
        deployWithdrawalLimitGuardFixture
      );
      const tx = {
        ...mockSafeTx,
        value: parseEther("0.5"),
        msgSender: user1.account.address,
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

    it("Should revert transaction exceeding daily limit", async function () {
      const { guard, user1 } = await loadFixture(
        deployWithdrawalLimitGuardFixture
      );
      const tx = {
        ...mockSafeTx,
        value: parseEther("1.5"), // Exceeds 1 ETH daily limit
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
        "Daily limit exceeded"
      );
    });

    it("Should track spent amount per user", async function () {
      const { guard, user1, user2 } = await loadFixture(
        deployWithdrawalLimitGuardFixture
      );

      // First user spends 0.5 ETH
      const tx1 = {
        ...mockSafeTx,
        value: parseEther("0.5"),
        msgSender: user1.account.address,
      };

      await guard.write.checkTransaction([
        tx1.to,
        tx1.value,
        tx1.data,
        tx1.operation,
        tx1.safeTxGas,
        tx1.baseGas,
        tx1.gasPrice,
        tx1.gasToken,
        tx1.refundReceiver,
        tx1.signatures,
        tx1.msgSender,
      ]);

      // Second user should still have full limit
      const tx2 = {
        ...mockSafeTx,
        value: parseEther("0.4"),
        msgSender: user2.account.address,
      };

      await expect(
        guard.write.checkTransaction([
          tx2.to,
          tx2.value,
          tx2.data,
          tx2.operation,
          tx2.safeTxGas,
          tx2.baseGas,
          tx2.gasPrice,
          tx2.gasToken,
          tx2.refundReceiver,
          tx2.signatures,
          tx2.msgSender,
        ])
      ).to.not.be.rejected;
    });

    it("Should reset daily limit after 24 hours", async function () {
      const { guard, user1 } = await loadFixture(
        deployWithdrawalLimitGuardFixture
      );

      // Spend 0.6 ETH
      const tx1 = {
        ...mockSafeTx,
        value: parseEther("0.6"),
        msgSender: user1.account.address,
      };

      await guard.write.checkTransaction([
        tx1.to,
        tx1.value,
        tx1.data,
        tx1.operation,
        tx1.safeTxGas,
        tx1.baseGas,
        tx1.gasPrice,
        tx1.gasToken,
        tx1.refundReceiver,
        tx1.signatures,
        tx1.msgSender,
      ]);

      // Advance time by 24 hours
      await time.increase(24 * 60 * 60);

      // Should be able to spend full limit again
      const tx2 = {
        ...mockSafeTx,
        value: parseEther("1"),
        msgSender: user1.account.address,
      };

      await expect(
        guard.write.checkTransaction([
          tx2.to,
          tx2.value,
          tx2.data,
          tx2.operation,
          tx2.safeTxGas,
          tx2.baseGas,
          tx2.gasPrice,
          tx2.gasToken,
          tx2.refundReceiver,
          tx2.signatures,
          tx2.msgSender,
        ])
      ).to.not.be.rejected;
    });

    it("Should accumulate spent amount within the same day", async function () {
      const { guard, user1 } = await loadFixture(
        deployWithdrawalLimitGuardFixture
      );

      // First transaction: 0.4 ETH
      const tx1 = {
        ...mockSafeTx,
        value: parseEther("0.4"),
        msgSender: user1.account.address,
      };

      await guard.write.checkTransaction([
        tx1.to,
        tx1.value,
        tx1.data,
        tx1.operation,
        tx1.safeTxGas,
        tx1.baseGas,
        tx1.gasPrice,
        tx1.gasToken,
        tx1.refundReceiver,
        tx1.signatures,
        tx1.msgSender,
      ]);

      // Second transaction: 0.4 ETH (should succeed)
      const tx2 = {
        ...mockSafeTx,
        value: parseEther("0.4"),
        msgSender: user1.account.address,
      };

      await expect(
        guard.write.checkTransaction([
          tx2.to,
          tx2.value,
          tx2.data,
          tx2.operation,
          tx2.safeTxGas,
          tx2.baseGas,
          tx2.gasPrice,
          tx2.gasToken,
          tx2.refundReceiver,
          tx2.signatures,
          tx2.msgSender,
        ])
      ).to.not.be.rejected;

      // Third transaction: 0.3 ETH (should fail as total would exceed daily limit)
      const tx3 = {
        ...mockSafeTx,
        value: parseEther("0.3"),
        msgSender: user1.account.address,
      };

      await expectRevert(
        guard.write.checkTransaction([
          tx3.to,
          tx3.value,
          tx3.data,
          tx3.operation,
          tx3.safeTxGas,
          tx3.baseGas,
          tx3.gasPrice,
          tx3.gasToken,
          tx3.refundReceiver,
          tx3.signatures,
          tx3.msgSender,
        ]),
        "Daily limit exceeded"
      );
    });
  });
});
