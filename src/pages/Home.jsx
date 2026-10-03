import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Store, LayoutGrid, Flame, Leaf, Utensils, Coffee, MapPin } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import StatusPill from '../components/ui/StatusPill';
import BottomTabBar from '../components/ui/BottomTabBar';
import { useRestaurants } from '../lib/RestaurantsContext';

const getCuisineIcon = (name) => {
  const n = name.toLowerCase();
  if (n === 'all') return <LayoutGrid className="w-4 h-4" />;
  if (n === 'open now') return <Clock className="w-4 h-4" />;
  if (n.includes('biryani') || n.includes('spicy') || n.includes('fast')) return <Flame className="w-4 h-4" />;
  if (n.includes('veg') || n.includes('healthy') || n.includes('salad')) return <Leaf className="w-4 h-4" />;
  if (n.includes('coffee') || n.includes('tea') || n.includes('cafe')) return <Coffee className="w-4 h-4" />;
  if (n.includes('south') || n.includes('north') || n.includes('indian')) return <MapPin className="w-4 h-4" />;
  return <Utensils className="w-4 h-4" />;
};

export default function Home() {
  const navigate = useNavigate();
  const { restaurants, loading } = useRestaurants();
  const [activeTab, setActiveTab] = useState('home');
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Only show approved restaurants to students
  const approvedRestaurants = restaurants.filter(r => r.status === 'approved');

  // Compute dynamic cuisines
  const uniqueCuisinesMap = new Map();
  approvedRestaurants.forEach(r => {
    (r.cuisineTags || []).forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed) {
        uniqueCuisinesMap.set(trimmed.toLowerCase(), trimmed); // preserves original casing of the last seen
      }
    });
  });
  const sortedCuisines = Array.from(uniqueCuisinesMap.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const CUISINES = ["All", "Open Now", ...sortedCuisines];

  // Filter logic combining chip filter + search text
  const filteredRestaurants = approvedRestaurants.filter(r => {
    // 1. Filter by Chip
    if (activeFilter === "Open Now" && !r.isOpen) return false;
    if (activeFilter !== "All" && activeFilter !== "Open Now") {
      const hasCuisine = (r.cuisineTags || []).some(tag => tag.trim().toLowerCase() === activeFilter.toLowerCase());
      if (!hasCuisine) return false;
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const matchName = r.name?.toLowerCase().includes(query);
      const matchCuisine = (r.cuisineTags || []).some(tag => tag.toLowerCase().includes(query));
      if (!matchName && !matchCuisine) return false;
    }

    return true;
  });

  if (loading) {
    return <div className="p-8 text-center text-text-secondary">Loading restaurants...</div>;
  }

  return (
    <div className="pb-32 px-4 max-w-lg mx-auto space-y-6 animate-in fade-in duration-500 pt-4">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Header with Search & Filters */}
      <header className="sticky top-0 z-30 pt-6 pb-2 bg-background/95 backdrop-blur-xl -mx-4 px-4 space-y-5 shadow-sm border-b border-text-secondary/5">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-serif">Good evening</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <GlassInput 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for restaurants, cuisines..." 
            className="pl-12 rounded-full py-4 shadow-sm w-full bg-surface/80"
          />
        </div>

        {/* Filter Chips (Horizontally scrollable) */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              onClick={(e) => {
                setActiveFilter(cuisine);
                e.target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }}
              className={`flex items-center gap-2 flex-shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === cuisine 
                  ? 'bg-accent text-white shadow-md shadow-accent/30 scale-105' 
                  : 'bg-surface/60 backdrop-blur-md text-text-secondary border border-text-secondary/20 hover:bg-surface/80 hover:text-text-primary'
              }`}
            >
              {getCuisineIcon(cuisine)}
              {cuisine}
            </button>
          ))}
        </div>
      </header>

      {/* Restaurant Feed */}
      <section className="space-y-5 px-1 mt-2">
        {filteredRestaurants.map((restaurant) => (
          <GlassCard 
            key={restaurant.id} 
            className="overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48 w-full overflow-hidden bg-surface cursor-pointer" onClick={() => navigate(`/restaurant/${restaurant.id}`)}>
              <img 
                src={restaurant.imageUrl} 
                alt={restaurant.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <StatusPill status={restaurant.isOpen ? "open" : "closed"} />
                {restaurant.isOpen && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {restaurant.deliveryWindow}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5">
              <h3 
                className="text-xl font-bold font-serif text-text-primary mb-1 cursor-pointer hover:text-accent transition-colors"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                {restaurant.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {restaurant.cuisineTags.map(tag => (
                  <span key={tag} className="text-xs font-medium text-text-secondary bg-surface px-2.5 py-1 rounded-md border border-text-secondary/10">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <GlassButton 
                  variant={restaurant.isOpen ? "primary" : "default"} 
                  className={`flex-1 py-2.5 text-sm font-bold ${!restaurant.isOpen ? 'opacity-80' : ''}`} 
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  {restaurant.isOpen ? 'Order Now' : 'View Menu'}
                </GlassButton>
                <GlassButton 
                  className="flex-1 py-2.5 text-sm font-bold" 
                  onClick={() => navigate(`/restaurant/${restaurant.id}?tab=details`)}
                >
                  View Details
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        ))}
        {approvedRestaurants.length === 0 ? (
          <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-8">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold font-serif text-text-primary">No spots open yet</h3>
            <p className="text-sm text-text-secondary">Our food partners are still setting up their kitchens. Please check back a little later!</p>
          </GlassCard>
        ) : filteredRestaurants.length === 0 && (
          <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-8 border-dashed border-2 border-text-secondary/20 bg-surface/30">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-serif text-text-primary">No matching restaurants</h3>
            <p className="text-sm text-text-secondary">We couldn't find any spots matching your craving. Try adjusting your search or filters.</p>
            {(activeFilter !== "All" || searchQuery) && (
              <GlassButton 
                variant="primary" 
                className="mt-2 py-2 px-6"
                onClick={() => {
                  setActiveFilter("All");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </GlassButton>
            )}
          </GlassCard>
        )}
      </section>

      {/* Floating Tab Bar */}
      <BottomTabBar activeTab="home" onTabChange={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
    </div>
  );
}
