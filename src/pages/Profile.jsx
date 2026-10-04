import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { signOutUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, LogOut, MessageCircle, Moon, Camera, Trash, Edit2, LayoutDashboard } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import BottomTabBar from '../components/ui/BottomTabBar';
import BottomSheet from '../components/ui/BottomSheet';
import GlassInput from '../components/ui/GlassInput';
import IOSToggle from '../components/ui/IOSToggle';
import Avatar from '../components/ui/Avatar';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [name, setName] = useState(user?.savedAddress?.name || user?.displayName || '');
  const [phone, setPhone] = useState(user?.savedAddress?.phone || '');
  const [addressType, setAddressType] = useState(user?.savedAddress?.type || 'hosteller');
  const [hostelName, setHostelName] = useState(user?.savedAddress?.hostelName || 'boys_hostel');
  const [pgArea, setPgArea] = useState(user?.savedAddress?.pgArea || '');
  const [pgName, setPgName] = useState(user?.savedAddress?.pgName || '');

  const [isNameSheetOpen, setIsNameSheetOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || '');

  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  // Dark mode state (reads from html class)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleToggleDark = (val) => {
    setIsDarkMode(val);
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    let finalAddress = '';
    if (addressType === 'hosteller') {
      finalAddress = hostelName === 'boys_hostel' ? 'Boys Hostel' : 'Girls Hostel';
    } else {
      finalAddress = `${pgName}, ${pgArea}`;
    }
    await updateUser({ 
      savedAddress: { 
        name, 
        phone, 
        address: finalAddress,
        type: addressType,
        hostelName,
        pgArea,
        pgName
      } 
    });
    setIsAddressOpen(false);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    await updateUser({ displayName: nameInput.trim() });
    setIsNameSheetOpen(false);
  };

  const handleSavePhoto = async (e) => {
    e.preventDefault();
    if (photoUrlInput && !photoUrlInput.startsWith('http')) {
      alert("URL must start with http:// or https://");
      return;
    }
    await updateUser({ photoURL: photoUrlInput || null });
    setIsPhotoSheetOpen(false);
  };
  
  const handleRemovePhoto = async () => {
    await updateUser({ photoURL: null });
    setIsPhotoSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10 animate-in fade-in">
      <header className="sticky top-0 sm:top-[64px] z-30 bg-background/90 backdrop-blur-md border-b border-text-secondary/5">
        <div className="page-container py-4">
          <h1 className="font-bold font-serif text-text-primary tracking-tight" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>Profile</h1>
        </div>
      </header>

      <div className="page-container space-y-5 pt-5">
        {/* User Card */}
        <GlassCard className="p-6 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-accent/10 text-accent px-2 py-1 rounded-full border border-accent/20">
              {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'restaurant_admin' ? 'Restaurant Partner' : 'Student'}
            </span>
          </div>
          
          <div 
            className="relative cursor-pointer group rounded-full"
            onClick={() => {
              setPhotoUrlInput(user?.photoURL || '');
              setIsPhotoSheetOpen(true);
            }}
          >
            <Avatar src={user?.photoURL} size="lg" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-text-primary truncate">{user?.displayName || 'Guest User'}</h2>
              <button 
                onClick={() => {
                  setNameInput(user?.displayName || '');
                  setIsNameSheetOpen(true);
                }} 
                className="p-1.5 text-text-secondary hover:text-accent rounded-full bg-surface/50 border border-text-secondary/10"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-text-secondary truncate">{user?.email || 'No email'}</p>
          </div>
        </GlassCard>

        {/* Admin Dashboard Access */}
        {(user?.role === 'superadmin' || user?.role === 'restaurant_admin') && (
          <GlassButton 
            className="w-full py-4 text-white font-bold bg-gradient-to-r from-accent to-accent/80 border-none shadow-lg shadow-accent/20 gap-2"
            onClick={() => navigate(user?.role === 'superadmin' ? '/super-admin' : '/admin')}
          >
            <LayoutDashboard className="w-5 h-5" />
            {user?.role === 'superadmin' ? 'Access Super Admin Panel' : 'View My Restaurant Dashboard'}
          </GlassButton>
        )}

        {/* Saved Address */}
        <div className="space-y-3">
          <h3 className="font-bold text-text-primary px-1 text-sm uppercase tracking-wider text-text-secondary">Saved Address</h3>
          <GlassCard 
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-surface-hover transition-colors"
            onClick={() => setIsAddressOpen(true)}
          >
            <div className="flex gap-4 items-center min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                {user?.savedAddress ? (
                  <>
                    <p className="font-semibold text-text-primary text-sm truncate">{user.savedAddress.name} • {user.savedAddress.phone}</p>
                    <p className="text-xs text-text-secondary truncate mt-0.5">{user.savedAddress.address}</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-text-secondary">No address saved. Tap to add.</p>
                )}
              </div>
            </div>
            <button className="p-2 text-text-secondary hover:text-accent rounded-full bg-surface shadow-sm border border-text-secondary/10 flex-shrink-0">
              <Edit2 className="w-4 h-4" />
            </button>
          </GlassCard>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h3 className="font-bold text-text-primary px-1 text-sm uppercase tracking-wider text-text-secondary">Settings</h3>
          
          <GlassCard className="p-1 divide-y divide-text-secondary/10">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3 text-text-primary">
                <Moon className="w-5 h-5" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <IOSToggle isOn={isDarkMode} onToggle={handleToggleDark} />
            </div>
            
            <a href="https://wa.me/918101389536" target="_blank" rel="noreferrer" className="p-4 flex justify-between items-center hover:bg-surface-hover transition-colors block">
              <div className="flex items-center gap-3 text-text-primary">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Partner with us</span>
              </div>
            </a>
          </GlassCard>
        </div>

        {/* Logout */}
        <GlassButton 
          className="w-full py-4 text-red-500 font-bold bg-red-500/10 border-red-500/20 hover:bg-red-500/20 gap-2 mt-8"
          onClick={() => signOutUser()}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </GlassButton>
      </div>

      <BottomSheet isOpen={isAddressOpen} onClose={() => setIsAddressOpen(false)} title="Edit Address">
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Name</label>
            <GlassInput required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full py-3" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Phone</label>
            <GlassInput required type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit Mobile Number" className="w-full py-3" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Accommodation Type</label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setAddressType('hosteller')}
                className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors ${addressType === 'hosteller' ? 'bg-accent/10 border-accent text-accent' : 'bg-surface/50 border-text-secondary/20 text-text-secondary'}`}
              >
                Hosteller
              </button>
              <button 
                type="button"
                onClick={() => setAddressType('pg')}
                className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors ${addressType === 'pg' ? 'bg-accent/10 border-accent text-accent' : 'bg-surface/50 border-text-secondary/20 text-text-secondary'}`}
              >
                PG
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-top-2">
            {addressType === 'hosteller' ? (
              <div className="space-y-1 mt-4">
                <label className="text-xs font-semibold text-text-secondary ml-1">Select Hostel</label>
                <select 
                  className="w-full p-4 rounded-2xl bg-surface/50 border border-text-secondary/20 focus:border-accent outline-none text-text-primary"
                  value={hostelName}
                  onChange={e => setHostelName(e.target.value)}
                >
                  <option value="boys_hostel">Boys Hostel</option>
                  <option value="girls_hostel">Girls Hostel</option>
                </select>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary ml-1">PG Area (e.g., Simhat, Narkel Bagan)</label>
                  <GlassInput required value={pgArea} onChange={e => setPgArea(e.target.value)} placeholder="Enter Area" className="w-full py-3" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary ml-1">PG Name (e.g., Pradyut Appartment)</label>
                  <GlassInput required value={pgName} onChange={e => setPgName(e.target.value)} placeholder="Enter PG Name" className="w-full py-3" />
                </div>
              </div>
            )}
          </div>
          <GlassButton type="submit" variant="primary" className="w-full py-4 mt-4 text-base">
            Save Address
          </GlassButton>
        </form>
      </BottomSheet>

      <BottomSheet isOpen={isPhotoSheetOpen} onClose={() => setIsPhotoSheetOpen(false)} title="Edit Profile Photo">
        <form onSubmit={handleSavePhoto} className="space-y-4 text-center pb-4">
          <div className="flex justify-center mb-4 mt-2">
            <Avatar src={photoUrlInput || user?.photoURL} size="lg" />
          </div>
          
          <div className="text-left space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Image URL</label>
            <GlassInput 
              value={photoUrlInput} 
              onChange={e => setPhotoUrlInput(e.target.value)} 
              placeholder="https://..." 
              className="w-full py-3" 
            />
          </div>
          
          <GlassButton type="submit" variant="primary" className="w-full py-4 mt-2 text-base">
            Save Photo
          </GlassButton>
          
          {user?.photoURL && (
            <GlassButton 
              type="button" 
              onClick={handleRemovePhoto}
              className="w-full py-4 text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 gap-2 mt-3"
            >
              <Trash className="w-5 h-5" />
              Remove Photo
            </GlassButton>
          )}
        </form>
      </BottomSheet>

      <BottomSheet isOpen={isNameSheetOpen} onClose={() => setIsNameSheetOpen(false)} title="Edit Name">
        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary ml-1">Display Name</label>
            <GlassInput required value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your Name" className="w-full py-3" />
          </div>
          <GlassButton type="submit" variant="primary" className="w-full py-4 mt-2 text-base">
            Save Name
          </GlassButton>
        </form>
      </BottomSheet>

      <BottomTabBar activeTab="profile" onTabChange={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
    </div>
  );
}

