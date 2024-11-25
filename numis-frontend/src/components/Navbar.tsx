import { useState } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';

const Navbar = () => {
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setDropdownOpen(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="win-navbar">
      <div className="win-navbar-content">
        {/* Title Bar */}
        <div className="win-title-bar">
          <div className="win-title-text">Numis Safe Manager</div>
          <div className="win-address-container">
            {address ? (
              <div className="win-address-panel">
                <div className="win-panel-row">
                  <span className="win-label">Address:</span>
                  <span
                    className="win-value"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {truncateAddress(address)}
                  </span>
                  <span className="win-label ml-4">Balance:</span>
                  <span className="win-value">
                    {balanceData ? balanceData.formatted : '0.00'} ETH
                  </span>
                </div>
                {dropdownOpen && (
                  <div className="win-dropdown">
                    <button
                      onClick={handleDisconnectWallet}
                      className="win-menu-button"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleConnectWallet} className="win-button">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
