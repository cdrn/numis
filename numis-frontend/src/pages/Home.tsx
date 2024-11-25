import SafeSelector from '@/components/SafeSelector';
import SafeDetails from '@/components/SafeDetails';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate, useLocation } from 'react-router-dom';

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

  return (
    <div className="win-desktop">
      {!isConnected ? (
        <div className="win-message-box">
          <div className="win-message-title">Connect Wallet</div>
          <div className="win-message-content">
            Connect your wallet to see your accounts
          </div>
        </div>
      ) : (
        <div className="win-workspace-content">
          {view === 'details' && managedSafe ? (
            <>
              <button onClick={handleBack} className="win-button mb-4">
                ← Back to Safe Selection
              </button>
              <SafeDetails safeAddress={managedSafe} />
            </>
          ) : (
            <SafeSelector
              onSafeSelect={setSafe}
              onManageSafe={handleManageSafe}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
