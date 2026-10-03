import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../lib/CartContext';

export default function BottomTabBar({ activeTab = 'home', onTabChange }) {
  const { itemCount } = useCart();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-surface/95 backdrop-blur-xl border-t border-text-secondary/10 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-8 py-3 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button 
            key={tab.id}
            onClick={() => onTabChange && onTabChange(tab.id)}
            className="flex flex-col items-center gap-1 group relative"
          >
            <div className={`p-1.5 rounded-full transition-all duration-300 relative ${
              isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'
            }`}>
              <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_var(--color-accent)] scale-110' : 'scale-100'}`} />
              {tab.id === 'cart' && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-background">
                  {itemCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium transition-colors duration-300 ${
              isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'
            }`}>
              {tab.label}
            </span>
            
            {isActive && (
              <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-accent drop-shadow-[0_0_4px_var(--color-accent)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
