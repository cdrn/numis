# Numis Contracts 🔒

## What is Numis?
Numis provides a secure way to manage crypto assets through composable Safe guards. Built on top of Gnosis Safe, it allows you to enhance your Safe's security through a flexible guard system where you can:

- 🛡️ Combine multiple guards through our MetaGuard for layered security
- 👥 Control access with WhitelistGuard to restrict transactions to approved addresses
- ⏰ Add time-locks for sensitive transactions with TimeLockGuard
- 💰 Require collateral for certain operations using CollateralManagerGuard
- 🔄 Easily add, remove and manage guards as your security needs change

## Quick Start 🚀

1. Clone the repository:
```bash
git clone https://github.com/numis-protocol/numis-contracts.git
cd numis-contracts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
# Add your environment variables
```

4. Run tests:
```bash
npx hardhat test
```

5. Deploy contracts:
```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```