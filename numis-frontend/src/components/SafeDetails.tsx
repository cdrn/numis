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

// Add a custom interface that matches your API response
interface CustomSafeTransaction
  extends Omit<SafeMultisigTransactionResponse, "proposer"> {
  proposer?: string; // Make proposer optional
}

const SafeDetails = ({ safeAddress }: SafeDetailsProps) => {
  const [safeInfo, setSafeInfo] = useState<any>(null);
  const [balances, setBalances] = useState<SafeBalance[]>([]);
  const [pendingTxs, setPendingTxs] = useState<CustomSafeTransaction[]>([]);
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
        <div className="w-16 h-16 border-8 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-100 border-4 border-black">
        <p className="text-2xl font-mono text-red-600 uppercase">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-8 bg-zinc-50">
      {/* Safe Basic Info */}
      <div className="bg-white border-4 border-black p-8 transform hover:translate-x-1 hover:translate-y-1 transition-transform">
        <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4">
          Safe Information
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="border-2 border-black p-4">
            <p className="text-lg font-bold uppercase">Address:</p>
            <p className="font-mono text-sm break-all bg-yellow-100 p-2 mt-2">
              {safeAddress}
            </p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-lg font-bold uppercase">Threshold:</p>
            <p className="text-3xl font-black mt-2">
              {safeInfo?.threshold}/{safeInfo?.owners?.length}
            </p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-lg font-bold uppercase">Nonce:</p>
            <p className="text-3xl font-black mt-2">{safeInfo?.nonce}</p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-lg font-bold uppercase">Version:</p>
            <p className="text-3xl font-black mt-2">{safeInfo?.version}</p>
          </div>
        </div>
      </div>

      {/* Owners */}
      <div className="bg-white border-4 border-black p-8 transform hover:translate-x-1 hover:translate-y-1 transition-transform">
        <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4">
          Owners
        </h2>
        <div className="space-y-4">
          {safeInfo?.owners?.map((owner: string, index: number) => (
            <div
              key={index}
              className="border-2 border-black p-4 hover:bg-yellow-100 transition-colors"
            >
              <p className="font-mono text-sm break-all">{owner}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Balances */}
      <div className="bg-white border-4 border-black p-8 transform hover:translate-x-1 hover:translate-y-1 transition-transform">
        <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4">
          Token Balances
        </h2>
        <div className="space-y-4">
          {balances?.map((balance, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-2 border-black p-4 hover:bg-green-100 transition-colors"
            >
              <div>
                <p className="text-xl font-black uppercase">
                  {balance?.token?.name || "Ethereum"}
                </p>
                <p className="text-sm font-bold">
                  {balance?.token?.symbol || "ETH"}
                </p>
              </div>
              <p className="font-mono text-2xl font-bold">
                {parseFloat(balance?.balance) /
                  Math.pow(10, balance?.token?.decimals || 18)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white border-4 border-black p-8 transform hover:translate-x-1 hover:translate-y-1 transition-transform">
        <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4">
          Pending Transactions
        </h2>
        <div className="space-y-4">
          {pendingTxs?.length > 0 ? (
            pendingTxs?.map((tx, index) => (
              <div
                key={index}
                className="border-2 border-black p-4 hover:bg-blue-100 transition-colors"
              >
                <p className="font-mono text-sm break-all mb-2">To: {tx?.to}</p>
                <p className="text-lg font-bold">Value: {tx?.value} Wei</p>
                <p className="mt-2 text-lg font-black bg-yellow-200 inline-block px-2">
                  {tx?.confirmations?.length || 0}/{safeInfo?.threshold}{" "}
                  CONFIRMS
                </p>
              </div>
            ))
          ) : (
            <p className="text-2xl font-black uppercase text-gray-500">
              No pending transactions
            </p>
          )}
        </div>
      </div>

      {/* Delegates */}
      <div className="bg-white border-4 border-black p-8 transform hover:translate-x-1 hover:translate-y-1 transition-transform">
        <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4">
          Delegates
        </h2>
        <div className="space-y-4">
          {delegates?.length > 0 ? (
            delegates?.map((delegate, index) => (
              <div
                key={index}
                className="border-2 border-black p-4 hover:bg-purple-100 transition-colors"
              >
                <p className="font-mono text-sm break-all mb-2">
                  {delegate?.delegate}
                </p>
                <p className="text-sm font-bold bg-purple-200 inline-block px-2">
                  Added by: {delegate?.delegator}
                </p>
              </div>
            ))
          ) : (
            <p className="text-2xl font-black uppercase text-gray-500">
              No delegates
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeDetails;
