import { useState } from 'react';
import SafeSelector from '@/components/SafeSelector';
import SafeDetails from '@/components/SafeDetails';

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);

  const handleManageSafe = (address: string) => {
    setSelectedSafe(address);
  };

  return (
    <div className="container mx-auto p-4">
      {selectedSafe ? (
        <SafeDetails safeAddress={selectedSafe} />
      ) : (
        <SafeSelector onManageSafe={handleManageSafe} />
      )}
    </div>
  );
}
