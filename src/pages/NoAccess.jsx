import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import GlassButton from '../components/ui/GlassButton';

export default function NoAccess() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background animate-in fade-in">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
      <p className="text-text-secondary mb-8 text-center max-w-xs">You don't have permission to view this page.</p>
      <GlassButton variant="primary" className="px-8 py-3" onClick={() => navigate('/')}>
        Return Home
      </GlassButton>
    </div>
  );
}
