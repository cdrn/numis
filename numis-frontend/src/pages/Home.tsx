import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <header className="bg-white shadow w-full">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ETH Treasury Management
          </h1>
        </div>
      </header>
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">
                Welcome to the ETH Treasury Management App
              </p>
            </div>
          </div>
        </div>
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
