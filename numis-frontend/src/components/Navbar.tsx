import { useState, useEffect } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ChevronDown, Wallet, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Connector } from 'wagmi';

const Navbar = () => {
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({
    address: address as `0x${string}`,
  });
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setIsOpen(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1">
            <div className="flex items-center">
              <Wallet className="mr-2 h-6 w-6" />
              <Link to="/">
                <span className="text-lg font-semibold">Numis</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {address ? (
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isOpen}
                  aria-label="Select account"
                  className="w-[280px] justify-between"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-medium">
                      {truncateAddress(address)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {balanceData
                        ? `${Number(balanceData.formatted).toFixed(4)} ETH`
                        : '0.00 ETH'}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-[280px] rounded-md border bg-popover p-1 shadow-md">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleDisconnectWallet}
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={handleConnectWallet}>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
