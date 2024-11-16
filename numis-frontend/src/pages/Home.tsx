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
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500 p-4">
                  Please create a Gnosis Safe account to proceed.
                </p>
                {/* Add steps or a form to guide the user through creating a Gnosis Safe account */}
                <div>
                  <SafeSelector onSafeSelect={setSafe} />
                  <div>{safe}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
