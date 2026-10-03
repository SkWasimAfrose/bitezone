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
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      // Browser will redirect to Google
    } catch (err) {
      console.error(err);
      setError("Failed to initialize Google Sign-in.");
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
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">BiteZone</h1>
            <p className="text-text-secondary text-sm">Sign in to order your food.</p>
          </div>
          
          <div className="w-full space-y-4">
            <button 
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#3c4043] border border-gray-300 py-2.5 px-4 rounded-full transition-all shadow-sm hover:shadow active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse font-medium text-[14px]">Connecting...</span>
              ) : (
                <>
                  <div className="w-5 h-5 flex-shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="text-[14px] font-medium tracking-wide" style={{ fontFamily: "'Roboto', arial, sans-serif" }}>
                    Continue with Google
                  </span>
                </>
              )}
            </button>
            
            {error && (
              <p className="text-red-500 text-sm mt-4 px-2">{error}</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
