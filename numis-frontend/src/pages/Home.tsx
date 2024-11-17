import SafeSelector from "@/components/SafeSelector";
import SafeDetails from "@/components/SafeDetails";
import React, { useState } from "react";
import { useAccount } from "wagmi";

const Home = () => {
  const { isConnected } = useAccount();
  const [safe, setSafe] = useState<any>(undefined);
  const [managedSafe, setManagedSafe] = useState<string | null>(null);

  const handleManageSafe = (safeAddress: string) => {
    setManagedSafe(safeAddress);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="flex-grow w-full flex items-center justify-center">
        {!isConnected ? (
          <div>Connect your wallet to see your accounts</div>
        ) : (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="p-4 px-10">
                {managedSafe ? (
                  <SafeDetails safeAddress={managedSafe} />
                ) : (
                  <SafeSelector
                    onSafeSelect={setSafe}
                    onManageSafe={handleManageSafe}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
