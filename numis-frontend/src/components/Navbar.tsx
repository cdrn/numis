import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  useAccount,
  useEnsName,
  useConnect,
  useBalance,
  useDisconnect,
  useChains,
} from 'wagmi';
import { useState, useEffect } from 'react';

export function Profile() {
  const { address } = useAccount();
  const { data, error, status } = useEnsName({ address });
  if (status === 'pending') return <div>Loading ENS name</div>;
  if (status === 'error')
    return <div>Error fetching ENS name: {error.message}</div>;
  return <div>ENS name: {data}</div>;
}

import { FC } from 'react';

const Navbar: FC = () => {
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const chains = useChains();
  const [activeChain, setActiveChain] = useState(chains[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleChainChange = () => {
      const newActiveChain = chains.find(
        (chain) => chain.id === activeChain.id,
      );
      setActiveChain(newActiveChain || chains[0]);
    };

    handleChainChange();
  }, [chains, activeChain.id]);

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
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-4 bg-white border-b-4 border-black">
      <div className="flex justify-between items-center w-full md:w-auto mb-4 md:mb-0">
        <button
          className="md:hidden px-4 py-2 border-2 border-black"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <NavigationMenu
        className={`${menuOpen ? 'block' : 'hidden'} md:block w-full md:w-auto`}
      >
        <NavigationMenuList className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 md:ml-0">
          <NavigationMenuLink
            href="/"
            className="px-4 py-2 font-black uppercase hover:bg-yellow-100 transition-colors text-left"
          >
            Dashboard
          </NavigationMenuLink>
          <NavigationMenuLink
            href="/portfolio"
            className="px-4 py-2 font-black uppercase hover:bg-yellow-100 transition-colors text-left"
          >
            Portfolio
          </NavigationMenuLink>
          <NavigationMenuLink
            href="/settings"
            className="px-4 py-2 font-black uppercase hover:bg-yellow-100 transition-colors text-left"
          >
            Settings
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>

      <div
        className={`${
          menuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-auto mt-4 md:mt-0`}
      >
        {address ? (
          <div className="relative">
            <div className="flex flex-col bg-white border-2 border-black p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <span className="font-black uppercase whitespace-nowrap">
                    Address:
                  </span>
                  <span
                    className="font-mono cursor-pointer hover:bg-yellow-100 px-2 truncate max-w-[200px]"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {truncateAddress(address)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <span className="font-black uppercase whitespace-nowrap">
                    Balance:
                  </span>
                  <span className="font-mono">
                    {balanceData ? balanceData.formatted : 'Loading...'} ETH
                  </span>
                </div>
              </div>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black">
                <button
                  onClick={handleDisconnectWallet}
                  className="block w-full text-left px-4 py-2 font-black uppercase hover:bg-red-100 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="w-full md:w-auto px-4 py-2 bg-white border-2 border-black hover:bg-blue-100 transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
