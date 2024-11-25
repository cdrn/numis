import { Address } from 'viem';

interface GuardConfigProps {
  type: string;
  config: any;
  setConfig: (config: any) => void;
}

export const GuardConfig = ({ type, config, setConfig }: GuardConfigProps) => {
  switch (type) {
    case 'timelock':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase">
            Timelock Duration (seconds)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-black"
            value={Number(config.timelockDuration || 0)}
            onChange={(e) =>
              setConfig({ ...config, timelockDuration: BigInt(e.target.value) })
            }
            min="0"
          />
        </div>
      );

    case 'whitelist':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase">
            Whitelisted Addresses (one per line)
          </label>
          <textarea
            className="w-full p-2 border border-black font-mono text-xs"
            value={config.whitelistAddresses?.join('\n') || ''}
            onChange={(e) => {
              const addresses = e.target.value
                .split('\n')
                .map((addr) => addr.trim())
                .filter(
                  (addr) => addr.length === 42 && addr.startsWith('0x'),
                ) as Address[];
              setConfig({ ...config, whitelistAddresses: addresses });
            }}
            placeholder="0x..."
            rows={4}
          />
        </div>
      );

    case 'withdrawal':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase">
            Daily Withdrawal Limit (ETH)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-black"
            value={Number(config.withdrawalLimit || 0) / 1e18}
            onChange={(e) =>
              setConfig({
                ...config,
                withdrawalLimit: BigInt(Number(e.target.value) * 1e18),
              })
            }
            min="0"
            step="0.1"
          />
        </div>
      );

    case 'collateral':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Collateral Managers (one per line)
            </label>
            <textarea
              className="w-full p-2 border border-black font-mono text-xs"
              value={config.collateralManagers?.join('\n') || ''}
              onChange={(e) => {
                const addresses = e.target.value
                  .split('\n')
                  .map((addr) => addr.trim())
                  .filter(
                    (addr) => addr.length === 42 && addr.startsWith('0x'),
                  ) as Address[];
                setConfig({ ...config, collateralManagers: addresses });
              }}
              placeholder="0x..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Whitelisted Contracts (one per line)
            </label>
            <textarea
              className="w-full p-2 border border-black font-mono text-xs"
              value={config.whitelistedContracts?.join('\n') || ''}
              onChange={(e) => {
                const addresses = e.target.value
                  .split('\n')
                  .map((addr) => addr.trim())
                  .filter(
                    (addr) => addr.length === 42 && addr.startsWith('0x'),
                  ) as Address[];
                setConfig({ ...config, whitelistedContracts: addresses });
              }}
              placeholder="0x..."
              rows={3}
            />
          </div>
        </div>
      );

    case 'meta':
      return (
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase">
            Meta Guard allows combining multiple guards.
          </p>
          <p className="text-xs text-gray-600">
            Deploy individual guards first, then add their addresses to the Meta
            Guard.
          </p>
        </div>
      );

    default:
      return null;
  }
};
