import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying guards with account:", deployer.address);

  const guards = {
    timelock: await deployTimelockGuard(),
    whitelist: await deployWhitelistGuard(),
    withdrawal: await deployWithdrawalLimitGuard(),
    collateral: await deployCollateralManagerGuard(),
    meta: await deployMetaGuard(),
  };

  // Save addresses to a file
  const addresses = Object.entries(guards).reduce(
    (acc, [name, contract]) => ({
      ...acc,
      [name]: contract.address,
    }),
    {}
  );

  writeFileSync(
    join(__dirname, "../deployed-guards.json"),
    JSON.stringify(addresses, null, 2)
  );

  console.log("Guards deployed successfully!");
  console.log("Addresses:", addresses);
}

async function deployTimelockGuard() {
  const TimelockGuard = await ethers.getContractFactory("TimelockGuard");
  const oneDay = 24n * 60n * 60n; // 1 day in seconds
  const guard = await TimelockGuard.deploy(oneDay);
  await guard.deployed();
  console.log("TimelockGuard deployed to:", guard.address);
  return guard;
}

async function deployWhitelistGuard() {
  const WhitelistGuard = await ethers.getContractFactory("WhitelistGuard");
  const guard = await WhitelistGuard.deploy([]);
  await guard.deployed();
  console.log("WhitelistGuard deployed to:", guard.address);
  return guard;
}

async function deployWithdrawalLimitGuard() {
  const WithdrawalLimitGuard = await ethers.getContractFactory(
    "WithdrawalLimitGuard"
  );
  const oneEthPerDay = ethers.utils.parseEther("1");
  const guard = await WithdrawalLimitGuard.deploy(oneEthPerDay);
  await guard.deployed();
  console.log("WithdrawalLimitGuard deployed to:", guard.address);
  return guard;
}

async function deployCollateralManagerGuard() {
  const CollateralManagerGuard = await ethers.getContractFactory(
    "CollateralManagerGuard"
  );
  const guard = await CollateralManagerGuard.deploy([], []);
  await guard.deployed();
  console.log("CollateralManagerGuard deployed to:", guard.address);
  return guard;
}

async function deployMetaGuard() {
  const MetaGuard = await ethers.getContractFactory("MetaGuard");
  const guard = await MetaGuard.deploy();
  await guard.deployed();
  console.log("MetaGuard deployed to:", guard.address);
  return guard;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
