import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";

export async function deployGuardFixture(
  contractName: string,
  constructorArgs: any[] = []
) {
  // Get test accounts
  const [deployer, user1, user2] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  // Deploy contract using viem
  const artifact = await hre.artifacts.readArtifact(contractName);
  const guard = await hre.viem.deployContract(contractName, constructorArgs);

  return {
    guard,
    deployer,
    user1,
    user2,
    publicClient,
  };
}

// Mock Safe transaction data
export const mockSafeTx = {
  to: getAddress("0x1234567890123456789012345678901234567890"),
  value: parseEther("1"),
  data: "0x",
  operation: 0n,
  safeTxGas: 0n,
  baseGas: 0n,
  gasPrice: 0n,
  gasToken: zeroAddress,
  refundReceiver: zeroAddress,
  signatures: "0x",
};

export async function expectRevert(
  promise: Promise<any>,
  expectedError: string
) {
  try {
    await promise;
    expect.fail("Expected transaction to revert");
  } catch (error: any) {
    expect(error.message).to.include(expectedError);
  }
}
