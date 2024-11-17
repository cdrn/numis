import { useState, useEffect } from "react";
import {
  getSafeInfo,
  getSafeBalances,
  getPendingTransactions,
  getSafeDelegates,
} from "@/api/safe";
import { SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";

interface SafeDetailsProps {
  safeAddress: string;
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

const SafeDetails = ({ safeAddress }: SafeDetailsProps) => {
  const [safeInfo, setSafeInfo] = useState<any>(null);
  const [balances, setBalances] = useState<SafeBalance[]>([]);
  const [pendingTxs, setPendingTxs] = useState<
    SafeMultisigTransactionResponse[]
  >([]);
  const [delegates, setDelegates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafeDetails = async () => {
      if (!safeAddress) return;

      setLoading(true);
      try {
        const [info, balanceData, pendingTransactions, delegateList] =
          await Promise.all([
            getSafeInfo(safeAddress),
            getSafeBalances(safeAddress),
            getPendingTransactions(safeAddress),
            getSafeDelegates(safeAddress),
          ]);

        setSafeInfo(info);
        setBalances(balanceData);
        setPendingTxs(pendingTransactions);
        setDelegates(delegateList);
      } catch (err) {
        setError("Failed to fetch safe details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSafeDetails();
  }, [safeAddress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Safe Basic Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Safe Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Address:</p>
            <p className="font-mono break-all">{safeAddress}</p>
          </div>
          <div>
            <p className="text-gray-600">Threshold:</p>
            <p>
              {safeInfo?.threshold} out of {safeInfo?.owners?.length} owners
            </p>
          </div>
          <div>
            <p className="text-gray-600">Nonce:</p>
            <p>{safeInfo?.nonce}</p>
          </div>
          <div>
            <p className="text-gray-600">Version:</p>
            <p>{safeInfo?.version}</p>
          </div>
        </div>
      </div>

      {/* Owners */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Owners</h2>
        <div className="space-y-2">
          {safeInfo?.owners?.map((owner: string, index: number) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-mono break-all">{owner}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Balances */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Token Balances</h2>
        <div className="space-y-4">
          {balances?.map((balance, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold">{balance?.token?.name}</p>
                <p className="text-gray-600">{balance?.token?.symbol}</p>
              </div>
              <p className="font-mono">
                {parseFloat(balance?.balance) /
                  Math.pow(10, balance?.token?.decimals)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Pending Transactions</h2>
        <div className="space-y-4">
          {pendingTxs?.length > 0 ? (
            pendingTxs?.map((tx, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-mono break-all">To: {tx?.to}</p>
                <p className="text-gray-600">Value: {tx?.value} Wei</p>
                <p className="text-sm text-gray-500">
                  Confirmations: {tx?.confirmations?.length || 0} /{" "}
                  {safeInfo?.threshold}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No pending transactions</p>
          )}
        </div>
      </div>

      {/* Delegates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Delegates</h2>
        <div className="space-y-2">
          {delegates?.length > 0 ? (
            delegates?.map((delegate, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-mono break-all">{delegate?.delegate}</p>
                <p className="text-sm text-gray-500">
                  Added by: {delegate?.delegator}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No delegates</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeDetails;
