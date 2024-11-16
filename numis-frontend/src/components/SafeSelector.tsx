import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

function SafeSelector({ onSafeSelect }: { onSafeSelect: any }) {
  const { address } = useAccount();
  const [safeList, setSafeList] = useState<string[]>([]);

  // Fetch safes when the component loads
  useEffect(() => {
    async function fetchSafes() {
      if (!address) return;
      try {
        const response = await fetch(
          `https://safe-transaction-mainnet.safe.global/api/v1/owners/${address}/safes/`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setSafeList(data.safes || []);
      } catch (error) {
        console.error("Error fetching safes:", error);
      }
    }

    fetchSafes();
  }, [address]);

  return (
    <div className="flex flex-col justify-center items-center">
      <ul className="list-disc">
        {safeList.length > 0 ? (
          safeList.map((safe, index) => (
            <li key={index} className="py-1">
              {safe}
            </li>
          ))
        ) : (
          <li className="py-1">No safes</li>
        )}
      </ul>
      <button
        onClick={() => onSafeSelect(address)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        <span>Manage</span> Safe
      </button>
    </div>
  );
}

export default SafeSelector;
