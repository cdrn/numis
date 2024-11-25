import { useState, useEffect } from 'react';
import {
  getSafeInfo,
  getSafeBalances,
  getPendingTransactions,
  getSafeDelegates,
} from '@/api/safe';
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import { parseAbi } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useGuards } from '@/hooks/useGuards';
import { GuardConfig } from '@/components/guards/GuardConfig';
import { Notification } from '@/components/ui/Notification';

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

interface GuardInfo {
  address: string | null;
  type: string | null;
}

const SAFE_GUARD_ABI = parseAbi([
  'function getGuard() external view returns (address)',
  'function setGuard(address guard) external',
]);

const SAFE_ASCII = `
  _____         ______ ______
 / ___/__ _____/ __/ // / __/
/ /__/ _ \`/ __/\\ \\/ _  / _/  
\\___/\\_,_/_/ /___/_//_/___/  
`;

const SafeDetails = ({ safeAddress }: SafeDetailsProps) => {
  const [safeInfo, setSafeInfo] = useState<any>(null);
  const [balances, setBalances] = useState<SafeBalance[]>([]);
  const [pendingTxs, setPendingTxs] = useState<
    SafeMultisigTransactionResponse[]
  >([]);
  const [delegates, setDelegates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardInfo, setGuardInfo] = useState<GuardInfo>({
    address: null,
    type: null,
  });
  const [selectedGuard, setSelectedGuard] = useState<string>('');
  const [config, setConfig] = useState<any>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'loading';
    message: string;
  } | null>(null);
  const publicClient = usePublicClient({ chainId: 1 });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    const fetchSafeDetails = async () => {
      if (!safeAddress || !publicClient) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch data with individual error handling
        let info, balanceData, pendingTransactions, delegateList;

        try {
          info = await getSafeInfo(safeAddress);
          setSafeInfo(info);
        } catch (err) {
          console.error('Failed to fetch safe info:', err);
          setError('Could not load Safe information. Please try again later.');
          return;
        }

        try {
          balanceData = await getSafeBalances(safeAddress);
          setBalances(balanceData);
        } catch (err) {
          console.error('Failed to fetch balances:', err);
          // Don't fail completely, just show empty balances
          setBalances([]);
        }

        try {
          pendingTransactions = await getPendingTransactions(safeAddress);
          setPendingTxs(pendingTransactions);
        } catch (err) {
          console.error('Failed to fetch pending transactions:', err);
          setPendingTxs([]);
        }

        try {
          delegateList = await getSafeDelegates(safeAddress);
          setDelegates(delegateList);
        } catch (err) {
          console.error('Failed to fetch delegates:', err);
          setDelegates([]);
        }

        // Get guard info
        try {
          const guardAddress = await publicClient.readContract({
            address: safeAddress as `0x${string}`,
            abi: SAFE_GUARD_ABI,
            functionName: 'getGuard',
          });
          setGuardInfo({
            address: (guardAddress as string) || null,
            type: 'Unknown',
          });
        } catch (err) {
          console.log('No guard set or incompatible Safe version');
          setGuardInfo({ address: null, type: null });
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch safe details:', err);
        setError(
          'Failed to load Safe details. Please check your connection and try again.',
        );
        setLoading(false);
      }
    };

    fetchSafeDetails();
  }, [safeAddress, publicClient]);

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
    <div className="retro-container">
      <pre className="ascii-art text-center py-4">{SAFE_ASCII}</pre>
      <div className="space-y-6 p-4">
        {/* Safe Basic Info */}
        <div className="retro-panel">
          <h2 className="retro-header">System Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-[var(--terminal-green)] p-2">
              <p className="text-sm uppercase">Address:</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs break-all p-1 mt-1 flex-1">
                  {safeAddress}
                </p>
                <button
                  onClick={() => copyToClipboard(safeAddress)}
                  className="retro-button mt-1 text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="border-2 border-[var(--terminal-green)] p-2">
              <p className="text-sm uppercase">Threshold:</p>
              <p className="text-xl mt-1">
                {safeInfo?.threshold}/{safeInfo?.owners?.length}
              </p>
            </div>
            <div className="border-2 border-[var(--terminal-green)] p-2">
              <p className="text-sm uppercase">Nonce:</p>
              <p className="text-xl mt-1">{safeInfo?.nonce}</p>
            </div>
            <div className="border-2 border-[var(--terminal-green)] p-2">
              <p className="text-sm uppercase">Version:</p>
              <p className="text-xl mt-1">{safeInfo?.version}</p>
            </div>
          </div>
        </div>

        {/* Owners */}
        <div className="retro-panel">
          <h2 className="retro-header">Authorized Users</h2>
          <div className="space-y-2">
            {safeInfo?.owners?.map((owner: string, index: number) => (
              <div
                key={index}
                className="border-2 border-[var(--terminal-green)] p-2 flex items-center gap-2"
              >
                <p className="font-mono text-xs break-all flex-1">
                  {`>${owner}`}
                </p>
                <button
                  onClick={() => copyToClipboard(owner)}
                  className="retro-button text-xs"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Balances */}
        <div className="retro-panel">
          <h2 className="retro-header">Asset Registry</h2>
          <div className="space-y-2">
            {balances?.map((balance, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-2 border-[var(--terminal-green)] p-2"
              >
                <div>
                  <p className="text-base uppercase">
                    {balance?.token?.name || 'Ethereum'}
                  </p>
                  <p className="text-xs">{balance?.token?.symbol || 'ETH'}</p>
                </div>
                <p className="font-mono text-base">
                  {parseFloat(balance?.balance) /
                    Math.pow(10, balance?.token?.decimals || 18)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="retro-panel">
          <h2 className="retro-header">Pending Transactions</h2>
          <div className="space-y-2">
            {pendingTxs?.length > 0 ? (
              pendingTxs?.map((tx, index) => (
                <div
                  key={index}
                  className="border-2 border-[var(--terminal-green)] p-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs break-all mb-1 flex-1">
                      To: {tx?.to}
                    </p>
                    <button
                      onClick={() => copyToClipboard(tx?.to)}
                      className="retro-button text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm">Value: {tx?.value} Wei</p>
                  <p className="mt-1 text-sm bg-yellow-200 inline-block px-1">
                    {tx?.confirmations?.length || 0}/{safeInfo?.threshold}{' '}
                    CONFIRMS
                  </p>
                </div>
              ))
            ) : (
              <p className="text-lg uppercase text-gray-500">
                No pending transactions
              </p>
            )}
          </div>
        </div>

        {/* Delegates */}
        <div className="retro-panel">
          <h2 className="retro-header">Delegates</h2>
          <div className="space-y-2">
            {delegates?.length > 0 ? (
              delegates?.map((delegate, index) => (
                <div
                  key={index}
                  className="border-2 border-[var(--terminal-green)] p-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs break-all mb-1 flex-1">
                      {delegate?.delegate}
                    </p>
                    <button
                      onClick={() => copyToClipboard(delegate?.delegate)}
                      className="retro-button text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs bg-purple-200 inline-block px-1">
                      Added by: {delegate?.delegator}
                    </p>
                    <button
                      onClick={() => copyToClipboard(delegate?.delegator)}
                      className="retro-button text-xs"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-lg uppercase text-gray-500">No delegates</p>
            )}
          </div>
        </div>

        {/* Guard Management */}
        <div className="retro-panel">
          <h2 className="retro-header">Guard Management</h2>
          <div className="space-y-4">
            {/* Current Guard */}
            <div className="border-2 border-[var(--terminal-green)] p-2">
              <p className="text-sm uppercase">Current Guard:</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs break-all p-1 mt-1 flex-1">
                  {guardInfo.address || 'No guard set'}
                </p>
                {guardInfo.address && (
                  <button
                    onClick={() => copyToClipboard(guardInfo.address!)}
                    className="retro-button text-xs"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>

            {/* Guard Selection */}
            <div className="border-2 border-[var(--terminal-green)] p-2">
              <p className="text-sm uppercase mb-2">Add Guard:</p>
              <select
                className="w-full p-2 border border-black mb-2"
                value={selectedGuard}
                onChange={(e) => setSelectedGuard(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a guard type</option>
                <option value="timelock">Timelock Guard</option>
                <option value="whitelist">Whitelist Guard</option>
                <option value="withdrawal">Withdrawal Limit Guard</option>
                <option value="collateral">Collateral Manager Guard</option>
                <option value="meta">Meta Guard</option>
              </select>

              {/* Guard Configuration Form */}
              {selectedGuard && (
                <GuardConfig
                  type={selectedGuard}
                  config={config}
                  setConfig={setConfig}
                />
              )}

              <button
                className="w-full mt-4 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400"
                onClick={async () => {
                  try {
                    setNotification({
                      type: 'loading',
                      message: 'Deploying guard...',
                    });
                    const tx = await deployGuard();
                    setNotification({
                      type: 'success',
                      message:
                        'Guard deployment transaction created. Please confirm in your wallet.',
                    });
                    console.log('Guard deployment transaction created:', tx);
                  } catch (err) {
                    console.error('Failed to deploy guard:', err);
                    setNotification({
                      type: 'error',
                      message: error || 'Failed to deploy guard',
                    });
                  }
                }}
                disabled={!selectedGuard || loading}
              >
                {loading ? 'Deploying...' : 'Deploy & Set Guard'}
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SafeDetails;
