import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Store, Receipt, Plus, ShieldCheck, Search } from 'lucide-react';
import { useRestaurants } from '../../lib/RestaurantsContext';
import { useOrders } from '../../lib/OrdersContext';
import { useAuth } from '../../lib/AuthContext';
import { userService } from '../../lib/services/userService';
import AdminDashboard from '../admin/AdminDashboard';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import BottomSheet from '../../components/ui/BottomSheet';
import GlassInput from '../../components/ui/GlassInput';
import StatusPill from '../../components/ui/StatusPill';
import IOSToggle from '../../components/ui/IOSToggle';
import Avatar from '../../components/ui/Avatar';

export default function SuperAdminDashboard() {
  const { restaurants, updateRestaurant, addRestaurant } = useRestaurants();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  const [editingUser, setEditingUser] = useState(null);
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ role: 'student', restaurantId: '' });

  useEffect(() => {
    if (activeTab === 'users') {
      const unsub = userService.subscribeUsers(
        (data) => setUsers(data),
        (err) => console.error(err)
      );
      return () => unsub();
    }
  }, [activeTab]);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [restForm, setRestForm] = useState({
    name: '', ownerName: '', phone: '', mapEmbedUrl: '', imageUrl: '',
  });

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      const newId = await addRestaurant({
        name: restForm.name,
        ownerName: restForm.ownerName,
        phone: restForm.phone,
        mapEmbedUrl: restForm.mapEmbedUrl || '',
        isOpen: false,
        status: 'approved',
        cuisineTags: [],
        imageUrl: restForm.imageUrl || '',
        address: '',
        description: '',
        deliveryWindows: {},
      });
      setIsAddSheetOpen(false);
      setRestForm({ name: '', ownerName: '', phone: '', mapEmbedUrl: '', imageUrl: '' });
      if (newId) setSelectedRestaurantId(newId);
    } catch (err) {
      console.error(err);
      alert('Failed to add restaurant');
    }
  };

  const openCount = restaurants.filter(r => r.isOpen).length;

  const getOrderDate = (createdAt) => {
    if (!createdAt) return new Date();
    return createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  };

  const todayOrders = orders.filter(
    (o) => getOrderDate(o.createdAt).toDateString() === new Date().toDateString()
  );

  const handleEditRole = (u) => {
    setEditingUser(u);
    setRoleForm({ role: u.role || 'student', restaurantId: u.restaurantId || '' });
    setIsRoleSheetOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (roleForm.role === 'restaurant_admin' && !roleForm.restaurantId) {
      return alert('Please select a restaurant');
    }
    if (
      editingUser.role === 'restaurant_admin' &&
      roleForm.role === 'restaurant_admin' &&
      editingUser.restaurantId &&
      editingUser.restaurantId !== roleForm.restaurantId
    ) {
      const oldRest = restaurants.find(r => r.id === editingUser.restaurantId)?.name || 'their current restaurant';
      const newRest = restaurants.find(r => r.id === roleForm.restaurantId)?.name || 'the new restaurant';
      if (!window.confirm(`This will move them from ${oldRest} to ${newRest}. Proceed?`)) return;
    }
    try {
      await userService.setUserRole(
        editingUser.uid,
        roleForm.role,
        roleForm.role === 'restaurant_admin' ? roleForm.restaurantId : null
      );
      alert('Role updated successfully!');
      setIsRoleSheetOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  if (selectedRestaurantId) {
    return (
      <AdminDashboard
        superAdminRestaurantId={selectedRestaurantId}
        onBack={() => setSelectedRestaurantId(null)}
      />
    );
  }

  const TABS = ['Overview', 'Restaurants', 'Users', 'Orders'];

  const filteredUsers = users.filter(u => {
    const matchSearch =
      (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (userRoleFilter === 'Students') return (u.role || 'student') === 'student';
    if (userRoleFilter === 'Restaurant Admins') return u.role === 'restaurant_admin';
    if (userRoleFilter === 'Super Admins') return u.role === 'superadmin';
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-10 animate-in fade-in">
      <div className="page-container pt-6 space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center bg-surface/50 p-4 rounded-2xl border border-text-secondary/10">
          <h1 className="font-bold font-serif text-text-primary tracking-tight flex items-center gap-2" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
            <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
            Super Admin
          </h1>
        </header>

        {/* Tab navigation */}
        <div className="chip-row border-b border-text-secondary/10 gap-0 pb-0">
          {TABS.map(tab => (
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
                  layoutId="super-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stat cards — auto-fill grid: 2 cols on mobile, 4 on desktop */}
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))' }}
            >
              <GlassCard
                className="p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-surface-hover transition-colors min-w-0"
                onClick={() => setActiveTab('restaurants')}
              >
                <Store className="w-8 h-8 text-accent mb-2 shrink-0" />
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">Restaurants</p>
                <p className="text-3xl font-bold font-serif text-text-primary mt-1">{restaurants.length}</p>
                <p className="text-xs text-[#4C7A5E] font-medium mt-1 truncate w-full">{openCount} open</p>
              </GlassCard>

              <GlassCard
                className="p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-surface-hover transition-colors min-w-0"
                onClick={() => setActiveTab('orders')}
              >
                <Receipt className="w-8 h-8 text-[#5B88A5] mb-2 shrink-0" />
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">Today's Orders</p>
                <p className="text-3xl font-bold font-serif text-text-primary mt-1">{todayOrders.length}</p>
              </GlassCard>

              <GlassCard
                className="p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-surface-hover transition-colors min-w-0"
                onClick={() => setActiveTab('orders')}
              >
                <Receipt className="w-8 h-8 text-accent mb-2 shrink-0" />
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">All-time Orders</p>
                <p className="text-3xl font-bold font-serif text-text-primary mt-1">{orders.length}</p>
              </GlassCard>

              <GlassCard
                className="p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-surface-hover transition-colors min-w-0"
                onClick={() => setActiveTab('users')}
              >
                <Users className="w-8 h-8 text-[#8B5CF6] mb-2 shrink-0" />
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate w-full">Users</p>
                <p className="text-3xl font-bold font-serif text-text-primary mt-1">{users.length || '—'}</p>
              </GlassCard>
            </div>
          </div>
        )}

        {/* RESTAURANTS TAB */}
        {activeTab === 'restaurants' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <GlassButton variant="primary" className="gap-2" onClick={() => setIsAddSheetOpen(true)}>
                <Plus className="w-4 h-4" /> Add Restaurant
              </GlassButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {restaurants.map(r => (
                <GlassCard
                  key={r.id}
                  className="p-5 cursor-pointer hover:bg-surface/60 transition-colors"
                  onClick={() => setSelectedRestaurantId(r.id)}
                >
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold font-serif text-text-primary text-base truncate" title={r.name}>{r.name}</h3>
                      <p className="text-sm text-text-secondary truncate" title={`${r.ownerName || r.ownerEmail} • ${r.phone}`}>
                        {r.ownerName || r.ownerEmail} • {r.phone}
                      </p>
                    </div>
                    <StatusPill status={r.status === 'approved' ? 'open' : 'closed'} customText={r.status.toUpperCase()} />
                  </div>

                  <div
                    className="flex items-center justify-between border-t border-text-secondary/10 pt-4 mt-2 gap-3"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-text-secondary font-bold uppercase mb-1">Status</span>
                      <select
                        value={r.status}
                        onChange={(e) => updateRestaurant(r.id, { status: e.target.value })}
                        className="bg-surface text-text-primary border border-text-secondary/20 rounded-lg px-3 py-1 text-sm font-medium outline-none"
                      >
                        <option value="approved">Approved</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs text-text-secondary font-bold uppercase mb-1">Store</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${r.isOpen ? 'text-green-500' : 'text-text-secondary'}`}>
                          {r.isOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                        <IOSToggle size="sm" isOn={r.isOpen} onToggle={(v) => updateRestaurant(r.id, { isOpen: v })} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Role filter chips */}
            <div className="chip-row">
              {['All', 'Students', 'Restaurant Admins', 'Super Admins'].map(f => (
                <button
                  key={f}
                  onClick={() => setUserRoleFilter(f)}
                  className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    userRoleFilter === f
                      ? 'bg-text-primary text-background'
                      : 'bg-surface text-text-secondary border border-text-secondary/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <GlassInput
                placeholder="Search users by name or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-11 rounded-full py-3"
              />
            </div>

            {/* User list */}
            <div className="space-y-3">
              {filteredUsers.map(u => {
                const isSelf = u.uid === currentUser?.uid;
                const restName =
                  u.role === 'restaurant_admin' && u.restaurantId
                    ? restaurants.find(r => r.id === u.restaurantId)?.name
                    : null;

                return (
                  <GlassCard
                    key={u.uid}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: avatar + name/email */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar src={u.photoURL} size="md" className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-bold font-serif text-text-primary truncate text-sm"
                          title={u.displayName || 'Guest'}
                        >
                          {u.displayName || 'Guest'}
                        </h3>
                        <p className="text-xs text-text-secondary truncate" title={u.email}>
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* Right: role badge + edit button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20 whitespace-nowrap">
                          {u.role === 'superadmin'
                            ? 'Super Admin'
                            : u.role === 'restaurant_admin'
                            ? 'Rest. Admin'
                            : 'Student'}
                        </span>
                        {restName && (
                          <span
                            className="truncate max-w-[100px] sm:max-w-[160px] text-[10px] font-medium text-text-secondary bg-surface border border-text-secondary/10 px-2 py-0.5 rounded whitespace-nowrap"
                            title={restName}
                          >
                            @ {restName}
                          </span>
                        )}
                      </div>
                      <GlassButton
                        onClick={() => handleEditRole(u)}
                        disabled={isSelf}
                        title={isSelf ? "You can't change your own role here" : 'Edit Role'}
                        className="shrink-0 px-3 py-1.5 text-xs font-bold whitespace-nowrap"
                      >
                        Edit Role
                      </GlassButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))' }}
          >
            {orders.map(order => (
              <GlassCard key={order.id} className="p-4 text-sm flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-text-primary truncate" title={order.restaurantName}>
                    {order.restaurantName}
                  </p>
                  <p className="text-xs text-text-secondary truncate" title={order.customer.name}>
                    By: {order.customer.name}
                  </p>
                  <p className="text-xs font-mono mt-1 text-text-secondary">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-accent font-medium mt-1">₹{order.total}</p>
                </div>
                <StatusPill
                  status={order.status === 'new' ? 'pending' : order.status === 'delivered' ? 'open' : 'closed'}
                  customText={order.status.replace(/_/g, ' ')}
                />
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Add Restaurant sheet */}
      <BottomSheet isOpen={isAddSheetOpen} onClose={() => setIsAddSheetOpen(false)} title="New Restaurant">
        <form onSubmit={handleAddRestaurant} className="space-y-4">
          <GlassInput required placeholder="Restaurant Name" value={restForm.name} onChange={e => setRestForm({ ...restForm, name: e.target.value })} />
          <GlassInput required placeholder="Owner Name" value={restForm.ownerName} onChange={e => setRestForm({ ...restForm, ownerName: e.target.value })} />
          <GlassInput required placeholder="Phone" value={restForm.phone} onChange={e => setRestForm({ ...restForm, phone: e.target.value })} />
          <GlassInput placeholder="Google Maps Embed URL (optional)" value={restForm.mapEmbedUrl} onChange={e => setRestForm({ ...restForm, mapEmbedUrl: e.target.value })} />
          <GlassInput placeholder="Image URL (optional)" value={restForm.imageUrl} onChange={e => setRestForm({ ...restForm, imageUrl: e.target.value })} />
          <GlassButton type="submit" variant="primary" className="w-full py-4 mt-2">
            Create Restaurant
          </GlassButton>
        </form>
      </BottomSheet>

      {/* Edit Role sheet */}
      <BottomSheet isOpen={isRoleSheetOpen} onClose={() => setIsRoleSheetOpen(false)} title="Edit Role">
        {editingUser && (
          <form onSubmit={handleSaveRole} className="space-y-4">
            <div className="bg-surface/50 p-3 rounded-xl border border-text-secondary/10 flex items-center gap-3">
              <Avatar src={editingUser.photoURL} size="md" />
              <div className="min-w-0">
                <p className="font-bold text-text-primary text-sm truncate">{editingUser.displayName || 'Guest'}</p>
                <p className="text-xs text-text-secondary truncate">{editingUser.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Role</label>
              <select
                className="w-full p-4 rounded-2xl bg-surface border border-text-secondary/20 focus:border-accent outline-none text-text-primary font-medium"
                value={roleForm.role}
                onChange={e => setRoleForm({ ...roleForm, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="restaurant_admin">Restaurant Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {roleForm.role === 'restaurant_admin' && (
              <div className="space-y-1 animate-in slide-in-from-top-2 fade-in">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Assign to Restaurant</label>
                <select
                  className="w-full p-4 rounded-2xl bg-surface border border-text-secondary/20 focus:border-accent outline-none text-text-primary font-medium"
                  value={roleForm.restaurantId}
                  required
                  onChange={e => setRoleForm({ ...roleForm, restaurantId: e.target.value })}
                >
                  <option value="" disabled>Select a restaurant...</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}

            <GlassButton type="submit" variant="primary" className="w-full py-4 mt-4">
              Save Role
            </GlassButton>
          </form>
        )}
      </BottomSheet>
    </div>
  );
}
