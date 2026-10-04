import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../lib/CartContext';
import { useAuth } from '../../lib/AuthContext';
import Avatar from './Avatar';

export default function TopNavBar() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Hide on admin routes and login
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin') ||
    location.pathname === '/login'
  ) {
    return null;
  }

  const tabs = [
    { id: '', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
  ];

  return (
    /* Only visible on tablet/desktop (sm+). Mobile gets BottomTabBar. */
    <nav className="hidden sm:flex sticky top-0 z-[100] bg-surface/95 backdrop-blur-xl border-b border-text-secondary/10 h-[64px] shadow-sm w-full">
      <div className="page-container flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold font-serif text-text-primary tracking-tight shrink-0">
          BiteZone
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const path = `/${tab.id}`;
            const isActive =
              location.pathname === path ||
              (tab.id === '' && location.pathname === '/');

            return (
              <Link
                key={tab.id}
                to={path}
                className="relative group flex items-center gap-1.5 py-2"
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-text-primary font-bold'
                      : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </span>
                {tab.id === 'cart' && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-3 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}

          {user.role !== 'student' && (
            <Link
              to={user.role === 'superadmin' ? '/super-admin' : '/admin'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold hover:bg-accent hover:text-white transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          )}

          {/* Profile avatar link */}
          <Link to="/profile" className="group flex items-center">
            <div className={`rounded-full ring-2 transition-all ${
              location.pathname === '/profile'
                ? 'ring-accent'
                : 'ring-transparent group-hover:ring-accent/50'
            }`}>
              <Avatar src={user?.photoURL} size="sm" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
