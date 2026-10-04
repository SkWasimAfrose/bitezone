import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, Clock, Map } from 'lucide-react';
import { useRestaurants } from '../lib/RestaurantsContext';
import { useCart } from '../lib/CartContext';
import { isAvailableNow } from '../lib/availability';
import GlassCard from '../components/ui/GlassCard';
import StatusPill from '../components/ui/StatusPill';
import GlassButton from '../components/ui/GlassButton';
import BottomSheet from '../components/ui/BottomSheet';

export default function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart, addItem, updateQuantity, itemCount, total } = useCart();
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const { restaurants, loading } = useRestaurants();
  const restaurant = restaurants.find(r => r.id === id);

  const categories = useMemo(() => {
    if (!restaurant) return [];
    return Array.from(new Set(restaurant.menu.map(item => item.category)));
  }, [restaurant]);

  // Initialize with the first available category, or the first category
  const [activeCategory, setActiveCategory] = useState(() => {
    if (!restaurant) return "";
    const availableCat = categories.find(cat => 
      restaurant.menu.some(item => item.category === cat && isAvailableNow(item.startTime, item.endTime))
    );
    return availableCat || categories[0] || "";
  });

  if (loading) {
    return <div className="p-8 text-center text-text-secondary">Loading restaurant...</div>;
  }

  if (!restaurant) {
    return <div className="p-8 text-center text-text-secondary">Restaurant not found</div>;
  }

  const filteredMenu = (activeCategory === "All" || !categories.includes(activeCategory))
    ? restaurant.menu 
    : restaurant.menu.filter(item => item.category === activeCategory);

  const currentTab = searchParams.get('tab') || 'menu';

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  let mapUrl = restaurant?.mapEmbedUrl || '';
  if (mapUrl.includes('<iframe')) {
    const srcMatch = mapUrl.match(/src="([^"]+)"/);
    if (srcMatch) {
      mapUrl = srcMatch[1];
    }
  } 

  // If it's an embed URL, Google blocks opening it in a new tab. 
  // Let's extract the coordinates to create a standard map link.
  if (mapUrl.includes('google.com/maps/embed')) {
    const latMatch = mapUrl.match(/!3d([-\d.]+)/);
    const lngMatch = mapUrl.match(/!2d([-\d.]+)/);
    if (latMatch && lngMatch) {
      mapUrl = `https://maps.google.com/?q=${latMatch[1]},${lngMatch[1]}`;
    }
  } else if (mapUrl) {
    mapUrl = mapUrl.replace(/\s+/g, '');
  }

  return (
    <div className="pb-32 max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto animate-in fade-in duration-500 bg-background min-h-screen">
      {/* Header Image & Back Button */}
      <div className="relative h-64 w-full">
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714]/80 via-[#1C1714]/30 to-transparent pointer-events-none" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Glass Overlay Title */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/20 p-4 rounded-2xl flex justify-between items-center shadow-lg">
          <h1 className="text-2xl font-bold font-serif text-white drop-shadow-md">{restaurant.name}</h1>
          <StatusPill status={restaurant.isOpen ? "open" : "closed"} />
        </div>
      </div>

      {/* Tabs Menu / Details */}
      <div className="px-4 mt-6">
        {!restaurant.isOpen && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm font-semibold text-center">
            This restaurant is currently closed.
          </div>
        )}
        <div className="flex gap-4 border-b border-text-secondary/10 pb-2 overflow-x-auto scrollbar-hide">
          {['Menu', 'Details'].map(tab => (
            <button 
              key={tab}
              onClick={() => handleTabChange(tab.toLowerCase())}
              className={`pb-2 text-sm font-bold transition-all relative px-2 ${currentTab === tab.toLowerCase() ? 'text-accent' : 'text-text-secondary'}`}
            >
              {tab}
              {currentTab === tab.toLowerCase() && <div className="absolute bottom-[-9px] left-0 right-0 h-1 bg-accent rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>

      {currentTab === 'menu' && (
        <div className="px-4 mt-6 space-y-6 animate-in fade-in">
          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-accent text-white shadow-md shadow-accent/30 scale-105' 
                    : 'bg-surface/60 backdrop-blur-md text-text-secondary border border-text-secondary/20 hover:bg-surface/80 hover:text-text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenu.map(item => {
              const available = restaurant.isOpen && isAvailableNow(item.startTime, item.endTime) && (item.inStock !== false);
              const cartItem = cart.items.find(i => i.itemId === item.id);
              const qty = cartItem ? cartItem.quantity : 0;

              return (
                <GlassCard key={item.id} className={`p-4 flex items-center justify-between gap-4 ${!available ? 'opacity-60 grayscale' : ''}`}>
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-surface">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold leading-tight truncate ${available ? 'text-text-primary' : 'text-text-secondary'}`} title={item.name}>{item.name}</h3>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className={`font-bold ${available ? 'text-accent' : 'text-text-secondary'}`}>₹{item.price}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center flex-shrink-0">
                    {!available ? (
                      <span className="text-[10px] font-bold text-text-secondary uppercase px-2 py-1 bg-surface rounded-md">Unavailable</span>
                    ) : qty > 0 ? (
                      <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-full border border-text-secondary/10">
                        <button 
                          onClick={() => updateQuantity(item.id, qty - 1)}
                          className="w-7 h-7 rounded-full bg-white dark:bg-black/40 flex items-center justify-center shadow-sm text-text-secondary hover:text-text-primary transition-colors active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-4 text-center font-bold text-sm text-text-primary">{qty}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="w-7 h-7 rounded-full bg-white dark:bg-black/40 flex items-center justify-center shadow-sm text-text-secondary hover:text-text-primary transition-colors active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addItem(restaurant.id, item)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm bg-surface border border-text-secondary/20 text-accent hover:bg-accent hover:text-white active:scale-75"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Location Section */}
      {currentTab === 'details' && (
        <div className="px-4 mt-6 animate-in fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Restaurant Name</p>
              <p className="text-lg font-bold text-text-primary mt-1">{restaurant.name}</p>
            </div>
            
            {restaurant.ownerName && (
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Owner</p>
                <p className="font-medium text-text-primary mt-1">{restaurant.ownerName}</p>
              </div>
            )}

            {restaurant.cuisineTags && restaurant.cuisineTags.length > 0 && (
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Cuisines</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {restaurant.cuisineTags.map(tag => (
                    <span key={tag} className="text-xs font-medium text-text-secondary bg-surface px-2.5 py-1 rounded-md border border-text-secondary/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {restaurant.phone && (
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Phone</p>
                <p className="font-medium text-text-primary mt-1">{restaurant.phone}</p>
              </div>
            )}
            
            {restaurant.address && (
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Address</p>
                <p className="font-medium text-text-primary mt-1">{restaurant.address}</p>
              </div>
            )}

            {restaurant.description && (
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Description</p>
                <p className="font-medium text-text-primary mt-1">{restaurant.description}</p>
              </div>
            )}
          </GlassCard>

          {mapUrl && (
            <div className="h-full flex items-start">
              <a 
                href={mapUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-surface/80 border border-text-secondary/20 rounded-2xl text-text-primary font-bold hover:bg-surface-hover transition-colors shadow-sm mt-0 md:mt-0 h-auto md:h-full min-h-[200px]"
              >
                <Map className="w-5 h-5 text-[#4C7A5E]" />
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      )}

      {/* Floating Cart Bar */}
      {currentTab === 'menu' && itemCount > 0 && (
        <div 
          onClick={() => setIsCartSheetOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-surface/90 backdrop-blur-xl border border-text-secondary/20 shadow-2xl rounded-2xl p-4 flex justify-between items-center z-40 animate-in slide-in-from-bottom-10 fade-in duration-300 cursor-pointer hover:bg-surface transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-sm text-text-secondary font-medium">{itemCount} item{itemCount !== 1 && 's'}</span>
            <span className="font-bold text-text-primary">₹{total.toFixed(2)}</span>
          </div>
          
          <GlassButton 
            variant="primary" 
            className="py-2 px-5 text-sm gap-2 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/cart');
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            View Cart
          </GlassButton>
        </div>
      )}

      {/* Quick Cart Preview Sheet */}
      <BottomSheet isOpen={isCartSheetOpen} onClose={() => setIsCartSheetOpen(false)} title="Your Cart">
        <div className="space-y-4">
          {cart.items.map(item => (
            <GlassCard key={item.itemId} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-text-primary truncate" title={item.name}>{item.name}</h3>
                <p className="text-accent font-semibold mt-1">₹{item.price}</p>
              </div>
              
              <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-full border border-text-secondary/10">
                <button 
                  onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-black/40 flex items-center justify-center shadow-sm text-text-secondary hover:text-text-primary transition-colors active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center font-bold text-sm text-text-primary">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-black/40 flex items-center justify-center shadow-sm text-text-secondary hover:text-text-primary transition-colors active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}
          
          <div className="border-t border-text-secondary/10 pt-4 flex justify-between font-bold text-text-primary text-lg">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <GlassButton 
            variant="primary" 
            className="w-full py-4 mt-4 text-base"
            onClick={() => {
              setIsCartSheetOpen(false);
              navigate('/cart');
            }}
          >
            Go to Checkout
          </GlassButton>
        </div>
      </BottomSheet>
    </div>
  );
}
