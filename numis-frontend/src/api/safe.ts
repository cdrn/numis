import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';

const SAFE_API_URL = import.meta.env.VITE_SAFE_API_BASE_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    });

    // If we get rate limited, wait and retry
    if (response.status === 429 && retries > 0) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
      await sleep(retryAfter * 1000);
      return fetchWithRetry(url, options, retries - 1);
    }

    // If we get a CORS error or other network error, retry with exponential backoff
    if (!response.ok && retries > 0) {
      await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

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
  try {
    const response = await fetchWithRetry(
      `${SAFE_API_URL}/api/v1/owners/${ownerAddress}/safes/`,
    );
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
    const response = await fetchWithRetry(
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
    const response = await fetchWithRetry(
      `${SAFE_API_URL}/api/v1/safes/${safeAddress}/balances/`,
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching safe balances:', error);
    return [];
  }
};

// Get all transactions for a safe
export const getSafeTransactions = async (
  safeAddress: string,
): Promise<SafeMultisigTransactionResponse[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/multisig-transactions/`,
  );
  if (!response.ok) throw new Error('Failed to fetch safe transactions');
  const data = await response.json();
  return data.results;
};

// Get pending transactions for a safe
export const getPendingTransactions = async (
  safeAddress: string,
): Promise<SafeMultisigTransactionResponse[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/multisig-transactions/?executed=false`,
  );
  if (!response.ok) throw new Error('Failed to fetch pending transactions');
  const data = await response.json();
  return data.results;
};

// Get all delegates for a safe
export interface SafeDelegate {
  safe: string;
  delegate: string;
  delegator: string;
  label: string;
  expiryDate: string;
}

export interface DelegatesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SafeDelegate[];
}

export const getSafeDelegates = async (
  safeAddress?: string,
  delegate?: string,
  delegator?: string,
  label?: string,
  limit?: number,
  offset?: number,
): Promise<SafeDelegate[]> => {
  const params = new URLSearchParams();
  if (safeAddress) params.append('safe', safeAddress);
  if (delegate) params.append('delegate', delegate);
  if (delegator) params.append('delegator', delegator);
  if (label) params.append('label', label);
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const queryString = params.toString();
  const url = `${SAFE_API_URL}/api/v2/delegates/${
    queryString ? '?' + queryString : ''
  }`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch delegates');
  const data: DelegatesResponse = await response.json();
  return data.results;
};

// Get all modules for a safe
export const getSafeModules = async (
  safeAddress: string,
): Promise<string[]> => {
  const response = await fetch(
    `${SAFE_API_URL}/api/v1/safes/${safeAddress}/modules/`,
  );
  if (!response.ok) throw new Error('Failed to fetch modules');
  const data = await response.json();
  return data.results;
};

// Add exports for the interfaces
export interface SafeInfo {
  address: string;
  version: string;
  owners: string[];
  threshold: number;
  nonce: number;
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
  confirmations: Array<{
    owner: string;
    signature: string;
  }>;
}
