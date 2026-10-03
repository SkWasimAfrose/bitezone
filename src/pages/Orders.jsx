import { useState } from 'react';
import { useOrders } from '../lib/OrdersContext';
import { useCart } from '../lib/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Package, CheckCircle, ChevronRight, XCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import BottomTabBar from '../components/ui/BottomTabBar';
import BottomSheet from '../components/ui/BottomSheet';
import StatusPill from '../components/ui/StatusPill';

export default function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const { addItem, clearCart, cart } = useCart();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const activeOrders = orders.filter(o => ['new', 'preparing', 'out_for_delivery'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  
  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleReorder = (order) => {
    if (cart.restaurantId && cart.restaurantId !== order.restaurantId) {
      if (!window.confirm("This will clear your current cart. Continue?")) return;
      clearCart();
    }
    // Add items to cart one by one (this isn't perfect, ideally a bulk add is better)
    order.items.forEach(item => {
      // reconstruct item object
      addItem(order.restaurantId, { id: item.itemId, name: item.name, price: item.price });
    });
    navigate('/cart');
  };

  const handleCancel = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await updateOrderStatus(orderId, 'cancelled');
        setSelectedOrder(null);
      } catch (err) {
        console.error(err);
        alert("Failed to cancel order");
      }
    }
  };

  const getOrderDate = (createdAt) => {
    if (!createdAt) return new Date();
    return createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  };

  const statusSteps = [
    { id: 'new', label: 'Placed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="pb-32 px-4 max-w-lg mx-auto animate-in fade-in min-h-screen">
      <header className="sticky top-0 z-30 pt-6 pb-4 bg-background/80 backdrop-blur-md">
        <h1 className="text-3xl font-bold font-serif text-text-primary tracking-tight px-1">Your Orders</h1>
        
        <div className="flex gap-4 mt-6 px-1">
          <button 
            onClick={() => setActiveTab('active')}
            className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'active' ? 'text-accent' : 'text-text-secondary'}`}
          >
            Active
            {activeTab === 'active' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'past' ? 'text-accent' : 'text-text-secondary'}`}
          >
            Past
            {activeTab === 'past' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full" />}
          </button>
        </div>
      </header>

      <div className="space-y-4 mt-4">
        <AnimatePresence mode="popLayout">
          {displayOrders.map(order => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard 
                className="p-5 cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-text-primary text-lg">{order.restaurantName}</h3>
                      <span className="text-xs font-mono bg-surface px-2 py-0.5 rounded text-text-secondary">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {getOrderDate(order.createdAt).toLocaleDateString()} at {getOrderDate(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <StatusPill status={order.status} customText={order.status.replace(/_/g, ' ')} />
                </div>
                
                <p className="text-sm text-text-secondary truncate mb-4">
                  {order.items.map(i => `${i.quantity} x ${i.name}`).join(', ')}
                </p>
                
                <div className="flex justify-between items-center border-t border-text-secondary/10 pt-4">
                  <span className="font-bold text-text-primary">₹{order.total.toFixed(2)}</span>
                  <div className="flex items-center text-accent text-sm font-bold gap-1">
                    Details <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {displayOrders.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 px-6">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-serif text-text-primary mb-2">No {activeTab} orders yet</h2>
              <p className="text-sm text-text-secondary">When you place an order, it will show up here so you can track it.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomSheet isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-bold text-lg text-text-primary">{selectedOrder.restaurantName}</h3>
              <p className="text-sm text-text-secondary">Order #{selectedOrder.id.slice(-6).toUpperCase()}</p>
            </div>

            {/* Tracker */}
            {selectedOrder.status !== 'cancelled' && (
              <div className="relative border-l-2 border-surface ml-4 space-y-6 py-2">
                {statusSteps.map((step, idx) => {
                  const currentIdx = statusSteps.findIndex(s => s.id === selectedOrder.status);
                  const isCompleted = idx <= currentIdx;
                  const isActive = idx === currentIdx;
                  return (
                    <div key={step.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background transition-colors ${isCompleted ? 'bg-accent' : 'bg-surface'}`}>
                        {isActive && <motion.div layoutId="ping" className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />}
                      </div>
                      <p className={`text-sm font-bold ${isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>{step.label}</p>
                      {isActive && <p className="text-xs text-accent mt-0.5">We're on it!</p>}
                    </div>
                  );
                })}
              </div>
            )}
            
            {selectedOrder.status === 'cancelled' && (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
                <XCircle className="w-5 h-5" /> Order Cancelled
              </div>
            )}

            <div className="bg-surface/50 rounded-2xl p-4 border border-text-secondary/10 space-y-3">
              {selectedOrder.items.map(item => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.quantity} x {item.name}</span>
                  <span className="text-text-primary font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-text-secondary/10 pt-3 mt-3 flex justify-between font-bold">
                <span className="text-text-primary">Total</span>
                <span className="text-accent">₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {selectedOrder.status === 'new' && (
                <GlassButton className="flex-1 py-3 text-red-500" onClick={() => handleCancel(selectedOrder.id)}>
                  Cancel Order
                </GlassButton>
              )}
              <GlassButton variant="primary" className="flex-1 py-3" onClick={() => handleReorder(selectedOrder)}>
                Reorder
              </GlassButton>
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomTabBar activeTab="orders" onTabChange={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
    </div>
  );
}
