import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  useAccount,
  useEnsName,
  useConnect,
  useBalance,
  useDisconnect,
  useChains,
} from "wagmi";
import { useState, useEffect } from "react";

export function Profile() {
  const { address } = useAccount();
  const { data, error, status } = useEnsName({ address });
  if (status === "pending") return <div>Loading ENS name</div>;
  if (status === "error")
    return <div>Error fetching ENS name: {error.message}</div>;
  return <div>ENS name: {data}</div>;
}

import { FC } from "react";

const Navbar: FC = () => {
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const chains = useChains();
  const [activeChain, setActiveChain] = useState(chains[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleChainChange = () => {
      const newActiveChain = chains.find(
        (chain) => chain.id === activeChain.id
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
    <div className="flex justify-between items-center px-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuLink
            href="/"
            className="p-2 m-4 transition-shadow duration-200"
          >
            <span>Dashboard</span>
          </NavigationMenuLink>
          <NavigationMenuLink
            href="/portfolio"
            className="p-2 m-4 transition-shadow duration-200"
          >
            <span>Portfolio</span>
          </NavigationMenuLink>
          <NavigationMenuLink
            href="/transactions"
            className="p-2 m-4 transition-shadow duration-200"
          >
            <span>Transactions</span>
          </NavigationMenuLink>
          <NavigationMenuLink
            href="/settings"
            className="p-2 m-4 transition-shadow duration-200"
          >
            <span>Settings</span>
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="ml-auto flex items-center space-x-4">
        {address ? (
          <div className="flex items-center space-x-4 bg-green-100 p-2 rounded relative">
            <span className="text-gray-700 font-semibold">Address:</span>
            <span
              className="text-gray-900 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {truncateAddress(address)}
            </span>
            <span className="text-gray-700 font-semibold">Balance:</span>
            <span className="text-gray-900">
              {balanceData ? balanceData.formatted : "Loading..."} ETH
            </span>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                <button
                  onClick={handleDisconnectWallet}
                  className="block w-full text-left px-4 py-2 text-gray-700"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
