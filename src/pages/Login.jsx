import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '../lib/auth';
import { useAuth } from '../lib/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

export default function Login() {
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // On success, AuthContext will update user state and trigger redirect above
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm relative">
        {/* Background glow effects */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-accent/30 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]" />
        
        <GlassCard className="p-8 relative z-10 flex flex-col items-center text-center space-y-8 border-white/20">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">khanakro</h1>
            <p className="text-text-secondary text-sm">Sign in to order your food.</p>
          </div>
          
          <div className="w-full space-y-4">
            <GlassButton 
              variant="primary" 
              className="w-full flex gap-3" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </GlassButton>
            
            {error && (
              <p className="text-red-500 text-sm mt-4 px-2">{error}</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
