import { useNavigate } from 'react-router-dom';
import SafeSelector from '@/components/SafeSelector';

export default function Home() {
  const navigate = useNavigate();

  const handleManageSafe = (address: string) => {
    navigate(`/safe/${address}`);
  };

  return (
    <div className="container mx-auto p-4">
      <SafeSelector onManageSafe={handleManageSafe} />
    </div>
  );
}
