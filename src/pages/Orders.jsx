import { useState, useEffect } from 'react';
import { useOrders } from '../lib/OrdersContext';
import { useCart } from '../lib/CartContext';
import { useRestaurants } from '../lib/RestaurantsContext';
import { CANCELLATION_WINDOW_MINUTES } from '../lib/constants';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Package, ChevronRight, XCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import BottomTabBar from '../components/ui/BottomTabBar';
import BottomSheet from '../components/ui/BottomSheet';
import StatusPill from '../components/ui/StatusPill';

export default function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const { addItem, clearCart, cart } = useCart();
  const { restaurants } = useRestaurants();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = orders.filter(o => ['new', 'preparing', 'out_for_delivery'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleReorder = (order) => {
    if (cart.restaurantId && cart.restaurantId !== order.restaurantId) {
      if (!window.confirm("This will clear your current cart. Continue?")) return;
      clearCart();
    }
    order.items.forEach(item => {
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
    { id: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10 animate-in fade-in">
      {/* Sticky header */}
      <header className="sticky top-0 sm:top-[64px] z-30 bg-background/90 backdrop-blur-md border-b border-text-secondary/5">
        <div className="page-container py-4">
          <h1
            className="font-bold font-serif text-text-primary tracking-tight"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}
          >
            Your Orders
          </h1>

          {/* Active / Past tabs */}
          <div className="flex gap-0 mt-4 border-b border-text-secondary/10">
            {['active', 'past'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 pr-6 text-sm font-bold capitalize transition-all ${
                  activeTab === tab ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="orders-underline"
                    className="absolute bottom-0 left-0 right-6 h-0.5 bg-accent rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Orders grid */}
      <main className="page-container pt-5">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))' }}
        >
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
                  className={`p-5 cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all ${
                    order.status === 'cancelled' ? 'opacity-60 grayscale-[0.5]' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-bold text-text-primary text-base truncate" title={order.restaurantName}>
                          {order.restaurantName}
                        </h3>
                        <span className="shrink-0 text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-text-secondary">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        {getOrderDate(order.createdAt).toLocaleDateString()} at{' '}
                        {getOrderDate(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <StatusPill status={order.status} customText={order.status.replace(/_/g, ' ')} />
                  </div>

                  <p className="text-sm text-text-secondary truncate mb-4">
                    {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 px-6 col-span-full"
              >
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent shadow-inner">
                  <Package className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold font-serif text-text-primary mb-2">
                  No {activeTab} orders yet
                </h2>
                <p className="text-sm text-text-secondary">
                  When you place an order, it will show up here so you can track it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Order Details — BottomSheet (sheet on mobile, modal on desktop) */}
      <BottomSheet isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
        {selectedOrder && (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="font-bold text-lg text-text-primary">{selectedOrder.restaurantName}</h3>
              <p className="text-sm text-text-secondary mt-0.5">Order #{selectedOrder.id.slice(-6).toUpperCase()}</p>
            </div>

            {/* Status tracker */}
            {selectedOrder.status !== 'cancelled' && (
              <div className="relative border-l-2 border-surface ml-4 space-y-5 py-2">
                {statusSteps.map((step, idx) => {
                  const currentIdx = statusSteps.findIndex(s => s.id === selectedOrder.status);
                  const isCompleted = idx <= currentIdx;
                  const isActive = idx === currentIdx;
                  return (
                    <div key={step.id} className="relative pl-6">
                      <div
                        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background transition-colors ${
                          isCompleted ? 'bg-accent' : 'bg-surface'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="ping"
                            className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50"
                          />
                        )}
                      </div>
                      <p className={`text-sm font-bold ${isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {step.label}
                      </p>
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

            {/* Items breakdown */}
            <div className="bg-surface/50 rounded-2xl p-4 border border-text-secondary/10 space-y-2">
              {selectedOrder.items.map(item => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span className="text-text-secondary min-w-0 truncate pr-2">{item.quantity} × {item.name}</span>
                  <span className="text-text-primary font-medium shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-text-secondary/10 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-text-primary">Total</span>
                <span className="text-accent">₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              {['new', 'preparing'].includes(selectedOrder.status) && (() => {
                const orderTime = getOrderDate(selectedOrder.createdAt).getTime();
                const expiryTime = orderTime + CANCELLATION_WINDOW_MINUTES * 60 * 1000;
                const timeRemaining = expiryTime - now;
                const canCancel = selectedOrder.status === 'new' && timeRemaining > 0;

                if (canCancel) {
                  const mins = Math.floor(timeRemaining / 60000);
                  const secs = Math.floor((timeRemaining % 60000) / 1000);
                  return (
                    <div className="flex-1 flex flex-col min-w-0">
                      <GlassButton
                        className="w-full py-3 text-red-500 border-red-500/20"
                        onClick={() => handleCancel(selectedOrder.id)}
                      >
                        Cancel Order
                      </GlassButton>
                      <span className="text-[10px] text-text-secondary mt-1 font-medium text-center">
                        Cancel window: {mins}:{secs.toString().padStart(2, '0')}
                      </span>
                    </div>
                  );
                } else {
                  const rest = restaurants.find(r => r.id === selectedOrder.restaurantId);
                  return (
                    <div className="flex-1 flex flex-col min-w-0">
                      <a href={`tel:${rest?.phone || ''}`} className="w-full">
                        <GlassButton className="w-full py-3 text-sm">
                          Call {selectedOrder.restaurantName}
                        </GlassButton>
                      </a>
                      <span className="text-[10px] text-text-secondary mt-1 font-medium text-center leading-tight">
                        Already preparing — call the restaurant to cancel.
                      </span>
                    </div>
                  );
                }
              })()}
              <GlassButton
                variant="primary"
                className="flex-1 py-3"
                onClick={() => handleReorder(selectedOrder)}
              >
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
