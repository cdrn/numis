import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import {
  getSafeInfo,
  getSafeBalances,
  getPendingTransactions,
  type SafeInfo,
  type SafeTransaction,
} from '@/api/safe';
import GuardManager from './GuardManager';

interface SafeBalance {
  tokenAddress: string;
  token: {
    name: string;
    symbol: string;
    decimals: number;
  };
  balance: string;
}

const SafeDetails = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null);
  const [balances, setBalances] = useState<SafeBalance[]>([]);
  const [pendingTxs, setPendingTxs] = useState<SafeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafeDetails = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch all Safe data in parallel
        const [info, balanceData, pendingTransactions] = await Promise.all([
          getSafeInfo(address),
          getSafeBalances(address),
          getPendingTransactions(address),
        ]);

        setSafeInfo(info);
        setBalances(balanceData || []);
        setPendingTxs(
          (pendingTransactions || []).map((tx) => ({
            to: tx.to,
            value: tx.value.toString(),
            data: tx.data || '',
            operation: tx.operation,
            safeTxGas: tx.safeTxGas.toString(),
            baseGas: tx.baseGas.toString(),
            gasPrice: tx.gasPrice.toString(),
            gasToken: tx.gasToken,
            refundReceiver: tx.refundReceiver || '',
            nonce: tx.nonce,
            confirmations: (tx.confirmations || []).map((conf) => ({
              owner: conf.owner,
              signature: conf.signature,
            })),
          })),
        );
      } catch (err) {
        console.error('Failed to fetch safe details:', err);
        setError('Failed to load Safe details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafeDetails();
  }, [address]);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Loading safe details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Safe Selection
      </Button>

      <div className="space-y-8">
        {/* Safe Info */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Safe Information</h2>
          </div>
          <div className="divide-y">
            <div className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{address}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(address || '')
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="text-sm">{safeInfo?.version}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Required Confirmations
                  </p>
                  <p className="text-sm">
                    {safeInfo?.threshold || 0} of{' '}
                    {safeInfo?.owners?.length || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nonce</p>
                  <p className="text-sm">{safeInfo?.nonce}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Owners */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Authorized Users</h2>
          </div>
          <div className="divide-y">
            {safeInfo?.owners?.map((owner: string, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <p className="font-mono text-sm">{owner}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(owner)}
                >
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Guards */}
        <GuardManager />

        {/* Pending Transactions */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Pending Transactions</h2>
          </div>
          <div className="divide-y">
            {pendingTxs.length > 0 ? (
              pendingTxs.map((tx, index) => (
                <div key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm">To: {tx.to}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(tx.to)}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm">Value: {tx.value} Wei</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        {tx.confirmations?.length || 0}/{safeInfo?.threshold}{' '}
                        Confirmations
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No pending transactions
              </div>
            )}
          </div>
        </div>

        {/* Balances */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Asset Registry</h2>
          </div>
          <div className="divide-y">
            {balances?.map((balance, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium">
                    {balance?.token?.name || 'Ethereum'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {balance?.token?.symbol || 'ETH'}
                  </p>
                </div>
                <p className="font-mono text-sm">
                  {parseFloat(balance?.balance) /
                    Math.pow(10, balance?.token?.decimals || 18)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeDetails;
