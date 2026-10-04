import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../lib/CartContext';
import { useAuth } from '../../lib/AuthContext';

export default function TopNavBar() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;
  
  // Hide on admin routes, login
  if (location.pathname.startsWith('/admin') || 
      location.pathname.startsWith('/super-admin') || 
      location.pathname === '/login') {
    return null;
  }

  const tabs = [
    { id: '', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="hidden md:flex sticky top-0 z-[100] bg-surface/95 backdrop-blur-xl border-b border-text-secondary/10 px-8 h-[72px] justify-between items-center w-full shadow-sm">
      <Link to="/" className="text-2xl font-bold font-serif text-text-primary tracking-tight">BiteZone</Link>
      <div className="flex items-center gap-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const path = `/${tab.id}`;
          const isActive = location.pathname === path || (tab.id === '' && location.pathname === '/');
          
          return (
            <Link key={tab.id} to={path} className="relative group flex items-center gap-2">
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`} />
              <span className={`text-sm font-medium transition-colors ${isActive ? 'text-text-primary font-bold' : 'text-text-secondary group-hover:text-text-primary'}`}>
                {tab.label}
              </span>
              {tab.id === 'cart' && itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          );
        })}
        {user.role !== 'student' && (
           <Link to={user.role === 'superadmin' ? '/super-admin' : '/admin'} className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold hover:bg-accent hover:text-white transition-all ml-4">
             <LayoutDashboard className="w-4 h-4" /> Dashboard
           </Link>
        )}
      </div>
    </nav>
  );
}
