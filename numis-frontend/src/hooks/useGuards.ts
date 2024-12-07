import { useContractRead } from 'wagmi';

const META_GUARD_ADDRESS = '0x...'; // Replace with actual deployed address

const guardAbi = [
  {
    name: 'getGuards',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
] as const;

export function useGuards() {
  const { data: guards, isLoading } = useContractRead({
    address: META_GUARD_ADDRESS as `0x${string}`,
    abi: guardAbi,
    functionName: 'getGuards',
  });

  return {
    guards: guards as readonly `0x${string}`[] | undefined,
    isLoading,
  };
}
