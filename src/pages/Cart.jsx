import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, Receipt, CheckCircle } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { useOrders } from '../lib/OrdersContext';
import { useRestaurants } from '../lib/RestaurantsContext';
import { isAvailableNow } from '../lib/availability';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import BottomSheet from '../components/ui/BottomSheet';
import BottomTabBar from '../components/ui/BottomTabBar';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, clearCart, total } = useCart();
  const { user, updateUser } = useAuth();
  const { placeOrder } = useOrders();
  const { restaurants } = useRestaurants();
  
  const [note, setNote] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Form state
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.savedAddress?.phone || '');
  const [address, setAddress] = useState(user?.savedAddress?.address || '');
  const [saveAddress, setSaveAddress] = useState(true);
  const [placing, setPlacing] = useState(false);

  const restaurant = restaurants.find(r => r.id === cart.restaurantId);
  const isClosed = restaurant ? !restaurant.isOpen : false;

  // Check if any items are out of their availability window
  const unavailableItems = cart.items.filter(cartItem => {
    if (!restaurant) return false;
    const menuDef = restaurant.menu.find(m => m.id === cartItem.itemId);
    if (!menuDef) return true;
    return !isAvailableNow(menuDef.startTime, menuDef.endTime) || !menuDef.inStock;
  });

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return alert("Please enter a valid 10-digit phone number");
    
    setPlacing(true);
    try {
      if (saveAddress && user) {
        await updateUser({ savedAddress: { name, phone, address } });
      }

      const orderData = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        customer: { uid: user?.uid || 'guest', name, phone, address },
        items: cart.items,
        total,
        note,
        paymentMethod: "COD"
      };

      const newOrder = await placeOrder(orderData);
      setSuccessOrder(newOrder);
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    } finally {
      setPlacing(false);
      setIsCheckoutOpen(false);
    }
  };

  if (successOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background animate-in fade-in duration-500">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-[#4C7A5E]/10 text-[#4C7A5E] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-text-primary tracking-tight">Order Placed!</h1>
          <p className="text-text-secondary">
            Your order from <span className="font-semibold text-text-primary">{successOrder.restaurantName}</span> has been placed.
          </p>
          <div className="bg-surface/50 border border-text-secondary/10 rounded-2xl p-4 inline-block">
            <p className="text-sm text-text-secondary">Order ID</p>
            <p className="font-mono font-medium text-text-primary mt-1">#{successOrder.id.slice(-6).toUpperCase()}</p>
          </div>
          
          <div className="pt-8 space-y-4 w-full max-w-sm mx-auto">
            <GlassButton variant="primary" className="w-full py-3" onClick={() => navigate('/orders')}>
              Track Order
            </GlassButton>
            <GlassButton className="w-full py-3" onClick={() => navigate('/')}>
              Back to Home
            </GlassButton>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!cart.restaurantId || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background animate-in fade-in">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6 text-accent shadow-inner">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-text-primary mb-2">Your cart feels a bit light</h2>
        <p className="text-text-secondary mb-8 text-center">Add some delicious dishes to get started.</p>
        <GlassButton variant="primary" className="px-8 py-3" onClick={() => navigate('/')}>
          Browse Restaurants
        </GlassButton>
        <BottomTabBar activeTab="cart" onTabChange={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
      </div>
    );
  }

  return (
    <div className="pb-40 px-4 max-w-lg mx-auto animate-in fade-in duration-300 min-h-screen bg-background">
      <header className="sticky top-0 z-30 pt-4 pb-4 bg-background/80 backdrop-blur-md flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface hover:bg-surface-hover transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-text-primary">Cart</h1>
      </header>

      <div className="space-y-6 mt-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-text-primary">{restaurant?.name || 'Restaurant'}</h2>
          <button onClick={clearCart} className="text-sm text-red-500 font-medium hover:underline">Clear all</button>
        </div>

        {isClosed && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-medium">
            This restaurant is currently closed. You cannot place orders right now.
          </div>
        )}
        
        {unavailableItems.length > 0 && !isClosed && (
          <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-2xl text-sm font-medium">
            Some items are currently unavailable for ordering. Please remove them to proceed.
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {cart.items.map(item => (
              <motion.div
                key={item.itemId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <GlassCard className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-text-primary truncate">{item.name}</h3>
                    <p className="text-accent font-semibold mt-1">₹{item.price}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-surface/50 p-1 rounded-full border border-text-secondary/10">
                    <button 
                      onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-black/40 flex items-center justify-center shadow-sm text-text-secondary hover:text-text-primary transition-colors active:scale-90"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <span className="w-4 text-center font-bold text-sm text-text-primary">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-black/40 flex items-center justify-center shadow-sm text-text-secondary hover:text-text-primary transition-colors active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8">
          <GlassInput 
            placeholder="Any specific requests? (Optional)" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-sm py-3"
          />
        </div>

        <GlassCard className="p-5 mt-6 space-y-3">
          <h3 className="font-bold text-text-primary mb-4">Bill Details</h3>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Item Total</span>
            <span className="font-medium">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Delivery Fee</span>
            <span className="text-green-500 font-medium">Free</span>
          </div>
          <div className="border-t border-text-secondary/10 pt-3 mt-3 flex justify-between font-bold text-text-primary text-lg">
            <span>Total to pay</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </GlassCard>
      </div>

      <div className="mt-8 pb-32">
        <GlassButton 
          variant="primary" 
          className="w-full py-4 text-lg font-bold shadow-xl shadow-accent/20"
          disabled={isClosed || unavailableItems.length > 0}
          onClick={() => setIsCheckoutOpen(true)}
        >
          {isClosed ? 'Restaurant Closed' : unavailableItems.length > 0 ? 'Remove unavailable items' : 'Proceed to Checkout'}
        </GlassButton>
      </div>

      <BottomSheet isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Delivery Details">
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Name</label>
            <GlassInput required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full py-3" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Phone</label>
            <GlassInput required type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit Mobile Number" className="w-full py-3" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Delivery Address</label>
            <textarea 
              required
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Room No, Hostel/PG, Landmark..." 
              className="w-full p-4 rounded-2xl bg-surface/50 border border-text-secondary/20 focus:border-accent outline-none text-text-primary placeholder:text-text-secondary/50 transition-colors min-h-[100px] resize-none text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="saveAdd" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="w-4 h-4 rounded accent-accent" />
            <label htmlFor="saveAdd" className="text-sm font-medium text-text-secondary">Save this address for next time</label>
          </div>

          <div className="bg-surface/50 p-4 rounded-xl border border-text-secondary/10 flex justify-between items-center mt-4">
            <span className="text-sm font-semibold text-text-secondary">Payment Method</span>
            <span className="font-bold text-text-primary">Cash on Delivery</span>
          </div>

          <GlassButton 
            type="submit"
            variant="primary" 
            className="w-full py-4 mt-6 text-base"
            disabled={placing}
          >
            {placing ? 'Placing Order...' : `Place Order • ₹${total.toFixed(2)}`}
          </GlassButton>
        </form>
      </BottomSheet>

      <BottomTabBar activeTab="cart" onTabChange={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
    </div>
  );
}
