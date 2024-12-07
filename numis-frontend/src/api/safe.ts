import { type SafeMultisigTransactionResponse as SDKSafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';

const SAFE_API_URL = import.meta.env.VITE_SAFE_API_BASE_URL;

export interface SafeInfo {
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

export interface SafeBalance {
  tokenAddress: string;
  token: {
    name: string;
    symbol: string;
    decimals: number;
  };
  balance: string;
}

export interface SafeMultisigConfirmation {
  owner: string;
  signature: string;
}

export interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: number;
  safeTxGas: string;
  baseGas: string;
  gasPrice: string;
  gasToken: string;
  refundReceiver: string;
  nonce: number;
  confirmations: SafeMultisigConfirmation[];
}

// Get all safes for an owner address
export const getSafes = async (ownerAddress: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `${SAFE_API_URL}/api/v1/owners/${ownerAddress}/safes/`,
    );
    if (!response.ok) throw new Error('Failed to fetch safes');
    const data = await response.json();
    return data.safes;
  } catch (error) {
    console.error('Error fetching safes:', error);
    return [];
  }
};

// Get detailed info about a specific safe
export const getSafeInfo = async (safeAddress: string): Promise<SafeInfo> => {
  try {
    const response = await fetch(
      `${SAFE_API_URL}/api/v1/safes/${safeAddress}/`,
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching safe info:', error);
    throw new Error('Failed to fetch safe info. Please try again later.');
  }
};

// Get token balances for a safe
export const getSafeBalances = async (
  safeAddress: string,
): Promise<SafeBalance[]> => {
  try {
    const response = await fetch(
      `${SAFE_API_URL}/api/v1/safes/${safeAddress}/balances/`,
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching safe balances:', error);
    return [];
  }
};

// Get pending transactions for a safe
export const getPendingTransactions = async (
  safeAddress: string,
): Promise<SDKSafeMultisigTransactionResponse[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/multisig-transactions/?executed=false`,
  );
  if (!response.ok) throw new Error('Failed to fetch pending transactions');
  const data = await response.json();
  return data.results;
};
