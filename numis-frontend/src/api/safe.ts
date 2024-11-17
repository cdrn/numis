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

interface SafeMultisigTransactionResponse {
  safe: string;
  to: string;
  value: string;
  data: string | null;
  operation: number;
  gasToken: string;
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  refundReceiver: string;
  nonce: number;
  executionDate: string | null;
  submissionDate: string;
  modified: string;
  blockNumber: number | null;
  transactionHash: string | null;
  safeTxHash: string;
  executor: string | null;
  isExecuted: boolean;
  isSuccessful: boolean | null;
  ethGasPrice: string | null;
  gasUsed: number | null;
  fee: string | null;
  origin: string | null;
  dataDecoded: any | null;
  confirmationsRequired: number;
  confirmations: Array<{
    owner: string;
    submissionDate: string;
    transactionHash: string | null;
    signature: string | null;
    signatureType: string;
  }>;
  trusted: boolean;
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
  offset?: number
): Promise<SafeDelegate[]> => {
  const params = new URLSearchParams();
  if (safeAddress) params.append("safe", safeAddress);
  if (delegate) params.append("delegate", delegate);
  if (delegator) params.append("delegator", delegator);
  if (label) params.append("label", label);
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  const queryString = params.toString();
  const url = `${SAFE_API_URL}/api/v2/delegates/${
    queryString ? "?" + queryString : ""
  }`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch delegates");
  const data: DelegatesResponse = await response.json();
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
