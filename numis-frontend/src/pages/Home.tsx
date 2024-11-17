import SafeSelector from "@/components/SafeSelector";
import React, { useState } from "react";
import { useAccount } from "wagmi";

const Home = () => {
  const { isConnected } = useAccount();
  const [safe, setSafe] = useState<any>(undefined);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="flex-grow w-full flex items-center justify-center">
        {!isConnected ? (
          <div>Connect your wallet to see your accounts</div>
        ) : (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="p-4 px-10">
                <SafeSelector onSafeSelect={setSafe} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
