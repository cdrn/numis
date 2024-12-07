import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import { getSafes } from '@/api/safe';

interface SafeSelectorProps {
  onManageSafe: (address: string) => void;
}

const SafeSelector = ({ onManageSafe }: SafeSelectorProps) => {
  const { address } = useAccount();
  const [safes, setSafes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafes = async () => {
      if (!address) return;

      try {
        setLoading(true);
        const userSafes = await getSafes(address);
        setSafes(userSafes || []);
      } catch (err) {
        console.error('Failed to fetch safes:', err);
        setError('Failed to load your Safes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSafes();
  }, [address]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Your Safes</h2>
        <p className="text-sm text-muted-foreground">
          Select a Safe to manage from the list below
        </p>
      </div>

      <div className="rounded-lg border">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading your Safes...
            </span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : safes.length > 0 ? (
          <div className="divide-y">
            {safes.map((safeAddress, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <p className="font-mono text-sm">{safeAddress}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageSafe(safeAddress)}
                >
                  Manage
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-8">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">No Safes Found</p>
              <p className="text-sm text-muted-foreground">
                You don't have any Safes associated with this wallet
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeSelector;
