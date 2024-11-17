import { SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";

const SAFE_API_URL = import.meta.env.VITE_SAFE_API_BASE_URL;

interface SafeInfo {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: string[];
  fallbackHandler: string;
  guard: string;
  version: string;
}

interface SafeBalance {
  tokenAddress: string;
  token: {
    name: string;
    symbol: string;
    decimals: number;
  };
  balance: string;
}

// Get all safes for an owner address
export const getSafes = async (ownerAddress: string): Promise<string[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/owners/${ownerAddress}/safes/`
  );
  if (!response.ok) throw new Error("Failed to fetch safes");
  const data = await response.json();
  return data.safes;
};

// Get detailed info about a specific safe
export const getSafeInfo = async (safeAddress: string): Promise<SafeInfo> => {
  const response = await fetch(`${SAFE_API_URL}/api/v1/safes/${safeAddress}/`);
  if (!response.ok) throw new Error("Failed to fetch safe info");
  return response.json();
};

// Get token balances for a safe
export const getSafeBalances = async (
  safeAddress: string
): Promise<SafeBalance[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/balances/`
  );
  if (!response.ok) throw new Error("Failed to fetch safe balances");
  return response.json();
};

// Get all transactions for a safe
export const getSafeTransactions = async (
  safeAddress: string
): Promise<SafeMultisigTransactionResponse[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/multisig-transactions/`
  );
  if (!response.ok) throw new Error("Failed to fetch safe transactions");
  const data = await response.json();
  return data.results;
};

// Get pending transactions for a safe
export const getPendingTransactions = async (
  safeAddress: string
): Promise<SafeMultisigTransactionResponse[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/multisig-transactions/?executed=false`
  );
  if (!response.ok) throw new Error("Failed to fetch pending transactions");
  const data = await response.json();
  return data.results;
};

// Get all delegates for a safe
export const getSafeDelegates = async (safeAddress: string): Promise<any[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/delegates/`
  );
  if (!response.ok) throw new Error("Failed to fetch delegates");
  const data = await response.json();
  return data.results;
};

// Get all modules for a safe
export const getSafeModules = async (
  safeAddress: string
): Promise<string[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/modules/`
  );
  if (!response.ok) throw new Error("Failed to fetch modules");
  const data = await response.json();
  return data.results;
};
