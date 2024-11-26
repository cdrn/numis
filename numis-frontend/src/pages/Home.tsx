import SafeSelector from '@/components/SafeSelector';
import SafeDetails from '@/components/SafeDetails';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { isConnected } = useAccount();
  const [safe, setSafe] = useState<any>(null);
  const [view, setView] = useState<'selector' | 'details'>('selector');
  const [managedSafe, setManagedSafe] = useState<string | null>(null);

  useEffect(() => {
    const savedSafe = localStorage.getItem('managedSafe');
    if (savedSafe) {
      setManagedSafe(savedSafe);
      setView('details');
    }
  }, []);

  const handleManageSafe = (safeAddress: string) => {
    setManagedSafe(safeAddress);
    setView('details');
    localStorage.setItem('managedSafe', safeAddress);
  };

  const handleBack = () => {
    setView('selector');
    setManagedSafe(null);
    localStorage.removeItem('managedSafe');
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Connect Your Wallet</h2>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to manage your Safe accounts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {view === 'details' && managedSafe ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-6"
          >
            ← Back to Safe Selection
          </Button>
          <SafeDetails safeAddress={managedSafe} />
        </>
      ) : (
        <SafeSelector onSafeSelect={setSafe} onManageSafe={handleManageSafe} />
      )}
    </div>
  );
};

export default Home;
