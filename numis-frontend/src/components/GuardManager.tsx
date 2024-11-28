import { useState } from 'react';
import { useContractRead, useContractWrite } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const GUARDS = [
  { name: 'Timelock Guard', address: '0x...' },
  { name: 'Whitelist Guard', address: '0x...' },
  { name: 'Withdrawal Limit Guard', address: '0x...' },
  { name: 'Collateral Manager Guard', address: '0x...' },
];

const META_GUARD_ADDRESS = '0x...'; // Replace with actual deployed address

export default function GuardManager() {
  const [selectedGuard, setSelectedGuard] = useState('');

  const { data: currentGuards, isLoading: isLoadingGuards } = useContractRead({
    address: META_GUARD_ADDRESS as `0x${string}`,
    abi: [
      {
        name: 'getGuards',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'address[]' }],
      },
    ],
    functionName: 'getGuards',
  });

  const { write: addGuard, isLoading: isAddingGuard } = useContractWrite({
    address: META_GUARD_ADDRESS as `0x${string}`,
    abi: [
      {
        name: 'addGuard',
        type: 'function',
        inputs: [{ type: 'address', name: 'guard' }],
        outputs: [],
      },
    ],
  });

  const { write: removeGuard, isLoading: isRemovingGuard } = useContractWrite({
    address: META_GUARD_ADDRESS as `0x${string}`,
    abi: [
      {
        name: 'removeGuard',
        type: 'function',
        inputs: [{ type: 'uint256', name: 'index' }],
        outputs: [],
      },
    ],
  });

  const handleAddGuard = () => {
    if (selectedGuard && addGuard) {
      try {
        addGuard({ args: [selectedGuard] });
        setSelectedGuard('');
      } catch (error) {
        console.error('Failed to add guard:', error);
      }
    }
  };

  const handleRemoveGuard = (index: number) => {
    if (removeGuard) {
      try {
        removeGuard({ args: [index] });
      } catch (error) {
        console.error('Failed to remove guard:', error);
      }
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold">Guards</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {/* Add New Guard */}
          <div className="flex items-center gap-4">
            <select
              className="rounded-md border px-3 py-2"
              value={selectedGuard}
              onChange={(e) => setSelectedGuard(e.target.value)}
            >
              <option value="">Select Guard</option>
              {GUARDS.map((guard) => (
                <option key={guard.address} value={guard.address}>
                  {guard.name}
                </option>
              ))}
            </select>
            <Button
              onClick={handleAddGuard}
              disabled={!selectedGuard || isAddingGuard}
            >
              {isAddingGuard && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Guard
            </Button>
          </div>

          {/* Current Guards */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Active Guards</h3>
            {isLoadingGuards ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading guards...
              </div>
            ) : currentGuards && currentGuards.length > 0 ? (
              <div className="space-y-2">
                {currentGuards.map((guard: string, index: number) => (
                  <div
                    key={guard}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <span className="font-mono">{guard}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveGuard(index)}
                      disabled={isRemovingGuard}
                    >
                      {isRemovingGuard && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No guards active</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
