import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, role, devOverride, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = devOverride ? devOverride.role : role;

  if (requiredRole && effectiveRole !== requiredRole) {
    if (requiredRole === 'restaurant_admin' && effectiveRole === 'superadmin') {
      // allow
    } else {
      return <Navigate to="/no-access" replace />;
    }
  }

  return children;
}
