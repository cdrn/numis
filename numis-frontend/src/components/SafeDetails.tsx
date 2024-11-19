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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
      <div className="flex justify-center items-center min-h-[150px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border-2 border-black">
        <p className="text-lg font-mono text-red-600 uppercase">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 bg-zinc-50">
      {/* Safe Basic Info */}
      <div className="bg-white border-2 border-black p-4">
        <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">
          Safe Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-black p-2">
            <p className="text-sm font-bold uppercase">Address:</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs break-all bg-yellow-100 p-1 mt-1 flex-1">
                {safeAddress}
              </p>
              <button
                onClick={() => copyToClipboard(safeAddress)}
                className="mt-1 px-2 py-1 text-xs border border-black hover:bg-yellow-100"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="border border-black p-2">
            <p className="text-sm font-bold uppercase">Threshold:</p>
            <p className="text-xl font-black mt-1">
              {safeInfo?.threshold}/{safeInfo?.owners?.length}
            </p>
          </div>
          <div className="border border-black p-2">
            <p className="text-sm font-bold uppercase">Nonce:</p>
            <p className="text-xl font-black mt-1">{safeInfo?.nonce}</p>
          </div>
          <div className="border border-black p-2">
            <p className="text-sm font-bold uppercase">Version:</p>
            <p className="text-xl font-black mt-1">{safeInfo?.version}</p>
          </div>
        </div>
      </div>

      {/* Owners */}
      <div className="bg-white border-2 border-black p-4">
        <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">
          Owners
        </h2>
        <div className="space-y-2">
          {safeInfo?.owners?.map((owner: string, index: number) => (
            <div
              key={index}
              className="border border-black p-2 flex items-center gap-2"
            >
              <p className="font-mono text-xs break-all flex-1">{owner}</p>
              <button
                onClick={() => copyToClipboard(owner)}
                className="px-2 py-1 text-xs border border-black hover:bg-yellow-100"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Balances */}
      <div className="bg-white border-2 border-black p-4">
        <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">
          Token Balances
        </h2>
        <div className="space-y-2">
          {balances?.map((balance, index) => (
            <div
              key={index}
              className="flex justify-between items-center border border-black p-2"
            >
              <div>
                <p className="text-base font-black uppercase">
                  {balance?.token?.name || "Ethereum"}
                </p>
                <p className="text-xs font-bold">
                  {balance?.token?.symbol || "ETH"}
                </p>
              </div>
              <p className="font-mono text-base font-bold">
                {parseFloat(balance?.balance) /
                  Math.pow(10, balance?.token?.decimals || 18)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white border-2 border-black p-4">
        <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">
          Pending Transactions
        </h2>
        <div className="space-y-2">
          {pendingTxs?.length > 0 ? (
            pendingTxs?.map((tx, index) => (
              <div key={index} className="border border-black p-2">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs break-all mb-1 flex-1">
                    To: {tx?.to}
                  </p>
                  <button
                    onClick={() => copyToClipboard(tx?.to)}
                    className="px-2 py-1 text-xs border border-black hover:bg-yellow-100"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm font-bold">Value: {tx?.value} Wei</p>
                <p className="mt-1 text-sm font-black bg-yellow-200 inline-block px-1">
                  {tx?.confirmations?.length || 0}/{safeInfo?.threshold}{" "}
                  CONFIRMS
                </p>
              </div>
            ))
          ) : (
            <p className="text-lg font-black uppercase text-gray-500">
              No pending transactions
            </p>
          )}
        </div>
      </div>

      {/* Delegates */}
      <div className="bg-white border-2 border-black p-4">
        <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">
          Delegates
        </h2>
        <div className="space-y-2">
          {delegates?.length > 0 ? (
            delegates?.map((delegate, index) => (
              <div key={index} className="border border-black p-2">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs break-all mb-1 flex-1">
                    {delegate?.delegate}
                  </p>
                  <button
                    onClick={() => copyToClipboard(delegate?.delegate)}
                    className="px-2 py-1 text-xs border border-black hover:bg-yellow-100"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold bg-purple-200 inline-block px-1">
                    Added by: {delegate?.delegator}
                  </p>
                  <button
                    onClick={() => copyToClipboard(delegate?.delegator)}
                    className="px-2 py-1 text-xs border border-black hover:bg-yellow-100"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-lg font-black uppercase text-gray-500">
              No delegates
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeDetails;
