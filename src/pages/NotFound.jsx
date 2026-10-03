import { useNavigate } from 'react-router-dom';
import { Map } from 'lucide-react';
import GlassButton from '../components/ui/GlassButton';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background animate-in fade-in">
      <div className="w-20 h-20 bg-surface text-text-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Map className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
      <h2 className="text-xl font-medium text-text-primary mb-2">Page Not Found</h2>
      <p className="text-text-secondary mb-8 text-center max-w-xs">The page you're looking for doesn't exist or has been moved.</p>
      <GlassButton variant="primary" className="px-8 py-3" onClick={() => navigate('/')}>
        Go Home
      </GlassButton>
    </div>
  );
}
