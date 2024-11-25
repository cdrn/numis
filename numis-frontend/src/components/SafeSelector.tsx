import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getSafes } from '@/api/safe';

function SafeSelector({
  onSafeSelect,
  onManageSafe,
}: {
  onSafeSelect: any;
  onManageSafe: (safe: string) => void;
}) {
  const { address } = useAccount();
  const [safeList, setSafeList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSafes() {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        const safes = await getSafes(address);
        console.log('safe data: ', safes);
        setSafeList(safes || []);
      } catch (error) {
        console.error('Error fetching safes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSafes();
  }, [address]);

  const handleSafeSelect = (safe: string) => {
    setSelectedSafe(safe);
    onSafeSelect(safe);
  };

  return (
    <div className="win-window">
      <div className="win-window-title">Safe Selection</div>
      <div className="win-window-content">
        {selectedSafe && (
          <div className="win-panel mb-4">
            <div className="win-panel-header">Currently Selected Safe</div>
            <div className="win-panel-content">
              <div className="win-panel-row">
                <span className="win-label">Address:</span>
                <span className="win-value">{selectedSafe}</span>
              </div>
              <button
                onClick={() => onManageSafe(selectedSafe)}
                className="win-button mt-4"
              >
                Manage Safe
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="win-loading">Loading...</div>
        ) : safeList.length > 0 ? (
          <div className="win-list">
            {safeList.map((safe, index) => (
              <button
                key={index}
                onClick={() => handleSafeSelect(safe)}
                className={`win-list-item ${
                  selectedSafe === safe ? 'win-list-item-selected' : ''
                }`}
              >
                <div className="win-list-item-content">
                  <span className="win-list-item-label">Safe Address:</span>
                  <span className="win-list-item-value">{safe}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="win-message-box">
            <div className="win-message-title">No Safes Found</div>
            <div className="win-message-content">
              Please create a Gnosis Safe to proceed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SafeSelector;
