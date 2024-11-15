import React from "react";
import { useAccount } from "wagmi";

const Home = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <main className="flex-grow w-full flex items-center justify-center">
        {!isConnected ? (
          <div>Connect your wallet to see your accounts</div>
        ) : (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500">
                  Please create a Gnosis Safe account to proceed.
                </p>
                {/* Add steps or a form to guide the user through creating a Gnosis Safe account */}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-white shadow w-full">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500 text-center">
            &copy; 2023 ETH Treasury Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
