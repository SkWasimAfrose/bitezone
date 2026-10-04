import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Search, Edit2, Plus, Clock, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useRestaurants } from '../../lib/RestaurantsContext';
import { useOrders } from '../../lib/OrdersContext';
import IOSToggle from '../../components/ui/IOSToggle';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import BottomSheet from '../../components/ui/BottomSheet';
import GlassInput from '../../components/ui/GlassInput';
import StatusPill from '../../components/ui/StatusPill';

export default function AdminDashboard({ superAdminRestaurantId, onBack }) {
  const { user } = useAuth();
  const { restaurants, updateRestaurant, setOpen, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurants();
  const { orders, updateOrderStatus } = useOrders();

  const effectiveRestaurantId = superAdminRestaurantId || user?.restaurantId;
  const restaurant = restaurants.find(r => r.id === effectiveRestaurantId);

  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('All');

  const [editingItem, setEditingItem] = useState(null);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({});
  const [settingsForm, setSettingsForm] = useState(null);

  useEffect(() => {
    if (activeTab === 'settings' && restaurant && !settingsForm) {
      setSettingsForm({
        name: restaurant.name || '',
        ownerName: restaurant.ownerName || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        imageUrl: restaurant.imageUrl || '',
        mapEmbedUrl: restaurant.mapEmbedUrl || '',
        cuisineTags: restaurant.cuisineTags?.join(', ') || '',
        description: restaurant.description || '',
      });
    }
  }, [activeTab, restaurant, settingsForm]);

  const handleSaveSettings = async () => {
    try {
      await updateRestaurant(restaurant.id, {
        ...settingsForm,
        mapEmbedUrl: settingsForm.mapEmbedUrl,
        cuisineTags: settingsForm.cuisineTags.split(',').map(s => s.trim()).filter(Boolean),
      });
      alert('Settings saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
  };

  if (!restaurant) {
    return <div className="p-8 text-center text-text-primary">Loading restaurant...</div>;
  }

  const restaurantOrders = orders.filter(o => o.restaurantId === effectiveRestaurantId);

  const filteredOrders = restaurantOrders.filter(o => {
    if (orderFilter === 'All') return true;
    return o.status === orderFilter.toLowerCase().replace(/ /g, '_');
  });

  const advanceOrderStatus = async (order) => {
    const nextStatus = {
      new: 'preparing',
      preparing: 'out_for_delivery',
      out_for_delivery: 'delivered',
    };
    if (nextStatus[order.status]) {
      await updateOrderStatus(order.id, nextStatus[order.status]);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm('Reject this order?')) {
      await updateOrderStatus(orderId, 'cancelled');
    }
  };

  const handleOpenMenuForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setMenuForm(item);
    } else {
      setEditingItem(null);
      setMenuForm({
        id: `item_${Date.now()}`,
        name: '',
        price: '',
        category: 'Lunch',
        startTime: '',
        endTime: '',
        availabilityWindow: '',
        imageUrl: '',
        inStock: true,
      });
    }
    setIsMenuSheetOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      const { id, ...dataToSave } = menuForm;
      if (editingItem) {
        await updateMenuItem(restaurant.id, editingItem.id, dataToSave);
      } else {
        await addMenuItem(restaurant.id, dataToSave);
      }
      setIsMenuSheetOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save menu item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await deleteMenuItem(restaurant.id, id);
      } catch (err) {
        console.error(err);
        alert('Failed to delete item');
      }
    }
  };

  const getOrderDate = (createdAt) => {
    if (!createdAt) return new Date();
    return createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  };

  const todayOrders = restaurantOrders.filter(
    o => getOrderDate(o.createdAt).toDateString() === new Date().toDateString() && o.status !== 'cancelled'
  );
  const revenue = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingCount = restaurantOrders.filter(o => ['new', 'preparing'].includes(o.status)).length;
  const outOfStockCount = restaurant.menu.filter(m => !m.inStock).length;

  const ORDER_FILTER_OPTIONS = ['All', 'New', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="min-h-screen bg-background pb-10 animate-in fade-in">
      <div className="page-container pt-6 space-y-6">

        {/* Back button (SuperAdmin context) */}
        {superAdminRestaurantId && (
          <button
            onClick={onBack}
            className="text-sm font-bold text-text-secondary hover:text-text-primary flex items-center gap-2"
          >
            ← Back to Super Admin
          </button>
        )}

        {/* Header card — restaurant name + open toggle */}
        <GlassCard className="p-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-accent/20 blur-3xl rounded-full pointer-events-none" />

          {/* Responsive: stack on mobile, side-by-side on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
            <div className="min-w-0 flex-1">
              <h1
                className="font-bold font-serif text-text-primary tracking-tight truncate"
                style={{ fontSize: 'clamp(1.25rem, 4vw, 1.875rem)' }}
              >
                {restaurant.name}
              </h1>
              <p className="text-text-secondary mt-1 text-sm">Manage your orders, menu, and settings.</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-surface/50 rounded-2xl border border-text-secondary/10 sm:min-w-[180px] shrink-0">
              <span className="font-bold text-text-primary mb-2 text-sm text-center">
                {restaurant.isOpen ? 'Accepting Orders' : 'Currently Closed'}
              </span>
              <IOSToggle size="lg" isOn={restaurant.isOpen} onToggle={(val) => setOpen(restaurant.id, val)} />
              <p className="text-xs text-text-secondary mt-2 text-center">Turn on every morning to receive orders.</p>
            </div>
          </div>
        </GlassCard>

        {/* Stat cards — auto-fill: 2 per row on mobile, 4 on desktop */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))' }}
        >
          <GlassCard className="p-4 flex flex-col justify-center items-center text-center min-w-0">
            <Package className="w-6 h-6 text-accent mb-2 shrink-0" />
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">Today's Orders</p>
            <p className="text-2xl font-bold font-serif text-text-primary mt-1">{todayOrders.length}</p>
          </GlassCard>
          <GlassCard className="p-4 flex flex-col justify-center items-center text-center min-w-0">
            <Clock className="w-6 h-6 text-[#5B88A5] mb-2 shrink-0" />
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">Pending</p>
            <p className="text-2xl font-bold font-serif text-text-primary mt-1">{pendingCount}</p>
          </GlassCard>
          <GlassCard className="p-4 flex flex-col justify-center items-center text-center min-w-0">
            <TrendingUp className="w-6 h-6 text-[#4C7A5E] mb-2 shrink-0" />
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">Revenue</p>
            <p className="text-2xl font-bold font-serif text-text-primary mt-1" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>₹{revenue}</p>
          </GlassCard>
          <GlassCard className="p-4 flex flex-col justify-center items-center text-center min-w-0">
            <AlertCircle className="w-6 h-6 text-[#A34A3A] mb-2 shrink-0" />
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">Out of Stock</p>
            <p className="text-2xl font-bold font-serif text-text-primary mt-1">{outOfStockCount}</p>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="chip-row border-b border-text-secondary/10 gap-0 pb-0">
          {['Orders', 'Menu', 'Settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`relative shrink-0 pb-3 px-3 text-sm font-bold transition-all ${
                activeTab === tab.toLowerCase() ? 'text-accent' : 'text-text-secondary'
              }`}
            >
              {tab}
              {activeTab === tab.toLowerCase() && (
                <motion.div
                  layoutId="adm-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Order filter chips */}
            <div className="chip-row">
              {ORDER_FILTER_OPTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    orderFilter === f
                      ? 'bg-text-primary text-background'
                      : 'bg-surface text-text-secondary border border-text-secondary/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {filteredOrders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <GlassCard
                    className="p-5 border-l-4"
                    style={{ borderLeftColor: order.status === 'new' ? '#F59E0B' : 'transparent' }}
                  >
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-bold font-serif text-text-primary text-base truncate" title={order.customer.name}>
                            {order.customer.name}
                          </h3>
                          <span className="shrink-0 text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-text-secondary">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary truncate" title={order.customer.phone}>
                          {order.customer.phone} • {getOrderDate(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <StatusPill status={order.status} customText={order.status.replace(/_/g, ' ')} />
                    </div>

                    <div className="bg-surface/50 rounded-xl p-3 mb-3 text-sm">
                      {order.items.map((i, idx) => (
                        <div key={idx}>{i.quantity} × {i.name}</div>
                      ))}
                      <div className="border-t border-text-secondary/10 mt-2 pt-2 font-bold text-text-primary">
                        Total: ₹{order.total}
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary mb-3 flex gap-2 items-start">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      {order.customer.address}
                    </p>

                    {order.note && (
                      <p className="text-sm bg-accent/10 text-accent p-2 rounded-lg mb-3">Note: {order.note}</p>
                    )}

                    <div className="flex gap-3">
                      {['new', 'preparing', 'out_for_delivery'].includes(order.status) && (
                        <GlassButton
                          className="text-red-500 border-red-500/20 px-4 shrink-0"
                          onClick={() => cancelOrder(order.id)}
                        >
                          Cancel
                        </GlassButton>
                      )}
                      {['new', 'preparing', 'out_for_delivery'].includes(order.status) && (
                        <GlassButton variant="primary" className="flex-1" onClick={() => advanceOrderStatus(order)}>
                          {order.status === 'new'
                            ? 'Accept & Prepare'
                            : order.status === 'preparing'
                            ? 'Send for Delivery'
                            : 'Mark Delivered'}
                        </GlassButton>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold font-serif text-text-primary">Menu Items</h2>
              <GlassButton className="px-4 py-2 gap-2 text-sm" variant="primary" onClick={() => handleOpenMenuForm()}>
                <Plus className="w-4 h-4" /> Add Item
              </GlassButton>
            </div>

            <div className="space-y-3">
              {restaurant.menu.map(item => (
                <GlassCard key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary truncate text-sm" title={item.name}>{item.name}</h3>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-accent font-bold">₹{item.price}</span>
                      <span className="text-text-secondary bg-surface px-2 rounded-full truncate" title={item.category}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">In stock</span>
                      <IOSToggle
                        size="sm"
                        isOn={item.inStock}
                        onToggle={async (v) => {
                          try {
                            await updateMenuItem(restaurant.id, item.id, { inStock: v });
                          } catch (err) {
                            console.error(err);
                            alert('Failed to update stock');
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleOpenMenuForm(item)}
                      className="p-1.5 rounded-lg bg-surface text-text-secondary hover:text-accent"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && settingsForm && (
          <GlassCard className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Restaurant Name</label>
                <GlassInput value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Owner Name</label>
                <GlassInput value={settingsForm.ownerName} onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                <GlassInput value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Cuisine Tags (comma separated)</label>
                <GlassInput value={settingsForm.cuisineTags} onChange={(e) => setSettingsForm({ ...settingsForm, cuisineTags: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Image URL</label>
              <GlassInput value={settingsForm.imageUrl} onChange={(e) => setSettingsForm({ ...settingsForm, imageUrl: e.target.value })} />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Google Maps Embed URL</label>
              <textarea
                value={settingsForm.mapEmbedUrl}
                onChange={(e) => setSettingsForm({ ...settingsForm, mapEmbedUrl: e.target.value })}
                className="w-full p-4 rounded-2xl bg-surface/50 border border-text-secondary/20 focus:border-accent outline-none text-text-primary text-sm min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Restaurant Address</label>
              <textarea
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full p-4 rounded-2xl bg-surface/50 border border-text-secondary/20 focus:border-accent outline-none text-text-primary text-sm min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1 mb-2 block">Description (Optional)</label>
              <textarea
                value={settingsForm.description}
                onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                className="w-full p-4 rounded-2xl bg-surface/50 border border-text-secondary/20 focus:border-accent outline-none text-text-primary text-sm min-h-[80px] resize-none"
              />
            </div>

            <GlassButton variant="primary" className="w-full" onClick={handleSaveSettings}>
              Save Settings
            </GlassButton>
          </GlassCard>
        )}
      </div>

      {/* Menu item sheet */}
      <BottomSheet isOpen={isMenuSheetOpen} onClose={() => setIsMenuSheetOpen(false)} title={editingItem ? 'Edit Item' : 'New Item'}>
        <form onSubmit={handleSaveMenu} className="space-y-4">
          <GlassInput required placeholder="Item Name" value={menuForm.name || ''} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} />
          <GlassInput required type="number" placeholder="Price (₹)" value={menuForm.price || ''} onChange={e => setMenuForm({ ...menuForm, price: Number(e.target.value) })} />
          <select
            className="w-full p-4 rounded-2xl bg-surface/50 border border-text-secondary/20 focus:border-accent outline-none text-text-primary"
            value={menuForm.category}
            onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
          >
            <option value="Lunch">Lunch</option>
            <option value="Biryani">Biryani</option>
            <option value="Dinner">Dinner</option>
            <option value="Snacks & Extras">Snacks & Extras</option>
          </select>
          <div className="flex gap-3">
            <GlassInput type="time" placeholder="Start Time" value={menuForm.startTime || ''} onChange={e => setMenuForm({ ...menuForm, startTime: e.target.value })} />
            <GlassInput type="time" placeholder="End Time" value={menuForm.endTime || ''} onChange={e => setMenuForm({ ...menuForm, endTime: e.target.value })} />
          </div>
          <GlassInput placeholder="Image URL (optional)" value={menuForm.imageUrl || ''} onChange={e => setMenuForm({ ...menuForm, imageUrl: e.target.value })} />
          <GlassButton type="submit" variant="primary" className="w-full py-4">Save Item</GlassButton>
          {editingItem && (
            <GlassButton
              type="button"
              className="w-full text-red-500"
              onClick={() => { handleDeleteItem(editingItem.id); setIsMenuSheetOpen(false); }}
            >
              Delete Item
            </GlassButton>
          )}
        </form>
      </BottomSheet>
    </div>
  );
}
