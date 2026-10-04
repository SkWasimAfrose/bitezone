import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../lib/CartContext';

/**
 * BottomTabBar — only rendered on mobile (< sm / 640px).
 * On sm+ the TopNavBar takes over.
 */
export default function BottomTabBar({ activeTab = 'home', onTabChange }) {
  const { itemCount } = useCart();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-text-secondary/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-around items-center z-50 transition-all duration-500"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingTop: '0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange && onTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 group relative min-w-0 flex-1"
          >
            <div
              className={`p-1.5 rounded-full transition-all duration-300 relative ${
                isActive
                  ? 'text-accent'
                  : 'text-text-secondary group-hover:text-text-primary'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />
              {tab.id === 'cart' && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-surface">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium transition-colors duration-300 leading-tight ${
                isActive
                  ? 'text-accent'
                  : 'text-text-secondary group-hover:text-text-primary'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
