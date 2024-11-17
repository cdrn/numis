import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getSafes } from "@/api/safe";

function SafeSelector({ onSafeSelect }: { onSafeSelect: any }) {
  const { address } = useAccount();
  const [safeList, setSafeList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);

  // Fetch safes when the component loads
  useEffect(() => {
    async function fetchSafes() {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        const safes = await getSafes(address);
        console.log("safe data: ", safes);
        setSafeList(safes || []);
      } catch (error) {
        console.error("Error fetching safes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSafes();
  }, [address]);

  const handleSafeSelect = (safe: string) => {
    setSelectedSafe(safe);
    onSafeSelect(safe);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Select a Safe
      </h2>

      {selectedSafe && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Currently Selected Safe:
          </h3>
          <p className="text-green-600 font-mono break-all">{selectedSafe}</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : safeList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {safeList.map((safe, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleSafeSelect(safe)}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                    selectedSafe === safe
                      ? "bg-blue-50 border-blue-500 shadow-md"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Safe Address:
                    </span>
                    <span className="text-sm font-mono text-gray-700 break-all">
                      {safe}
                    </span>
                    <span
                      className={`mt-2 px-3 py-1 rounded-full text-sm ${
                        selectedSafe === safe
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedSafe === safe ? "Selected" : "Select this Safe"}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No Safes Found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please create a Gnosis Safe to proceed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SafeSelector;
