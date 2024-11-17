import SafeSelector from "@/components/SafeSelector";
import SafeDetails from "@/components/SafeDetails";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useNavigate, useLocation } from "react-router-dom";

const Home = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Get initial state from URL params or localStorage
  const [safe, setSafe] = useState<any>(() => {
    const urlSafe = searchParams.get("safe");
    if (urlSafe) return JSON.parse(urlSafe);
    const savedSafe = localStorage.getItem("safe");
    return savedSafe ? JSON.parse(savedSafe) : undefined;
  });

  const [managedSafe, setManagedSafe] = useState<string | null>(() => {
    const urlManagedSafe = searchParams.get("managedSafe");
    if (urlManagedSafe) return urlManagedSafe;
    return localStorage.getItem("managedSafe");
  });

  const [view, setView] = useState<"selector" | "details">(() => {
    return (searchParams.get("view") as "selector" | "details") || "selector";
  });

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (safe) params.set("safe", JSON.stringify(safe));
    if (managedSafe) params.set("managedSafe", managedSafe);
    params.set("view", view);
    navigate(`?${params.toString()}`, { replace: true });
  }, [safe, managedSafe, view]);

  const handleManageSafe = (safeAddress: string) => {
    setManagedSafe(safeAddress);
    setView("details");
    localStorage.setItem("managedSafe", safeAddress);
  };

  const handleSetSafe = (newSafe: any) => {
    setSafe(newSafe);
    localStorage.setItem("safe", JSON.stringify(newSafe));
  };

  const handleBack = () => {
    setView("selector");
    setManagedSafe(null);
    localStorage.removeItem("managedSafe");
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <main className="max-w-7xl mx-auto">
        {!isConnected ? (
          <div className="p-8 bg-white border-4 border-black text-4xl font-black uppercase text-center">
            Connect your wallet to see your accounts
          </div>
        ) : (
          <div className="space-y-8">
            {view === "details" && managedSafe ? (
              <>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-white border-4 border-black font-black uppercase hover:bg-yellow-100 transform hover:translate-x-1 hover:translate-y-1 transition-transform"
                >
                  ← Back to Safe Selection
                </button>
                <SafeDetails safeAddress={managedSafe} />
              </>
            ) : (
              <div className="bg-white border-4 border-black p-8">
                <SafeSelector
                  onSafeSelect={setSafe}
                  onManageSafe={handleManageSafe}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
