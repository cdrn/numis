import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getSafes } from "@/api/safe";

function SafeSelector({
  onSafeSelect,
  onManageSafe,
}: {
  onSafeSelect: any;
  onManageSafe: (safe: string) => void;
}) {
  const { address } = useAccount();
  const [safeList, setSafeList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);

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
    <div className="w-full">
      <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4">
        Select a Safe
      </h2>

      {selectedSafe && (
        <div className="mb-8 border-4 border-black p-4 bg-green-100">
          <h3 className="text-xl font-black uppercase mb-2">
            Currently Selected Safe:
          </h3>
          <p className="font-mono text-sm break-all mb-4">{selectedSafe}</p>
          <button
            onClick={() => onManageSafe(selectedSafe)}
            className="px-6 py-3 bg-white border-4 border-black font-black uppercase hover:bg-blue-100 transform hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            Manage Safe
          </button>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-2xl font-black uppercase text-center">
            Loading...
          </div>
        ) : safeList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {safeList.map((safe, index) => (
              <div key={index}>
                <button
                  onClick={() => handleSafeSelect(safe)}
                  className={`w-full border-4 border-black p-4 hover:bg-yellow-100 transition-colors ${
                    selectedSafe === safe ? "bg-yellow-200" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-lg font-black uppercase">
                      Safe Address:
                    </span>
                    <span className="font-mono text-sm break-all">{safe}</span>
                    <span className="mt-2 px-4 py-1 border-2 border-black font-black uppercase">
                      {selectedSafe === safe ? "Selected" : "Select this Safe"}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border-4 border-black text-center">
            <h3 className="text-2xl font-black uppercase mb-4">
              No Safes Found
            </h3>
            <p className="text-lg font-bold">
              Please create a Gnosis Safe to proceed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SafeSelector;
