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
        uniqueCuisinesMap.set(trimmed.toLowerCase(), trimmed);
      }
    });
  });
  const sortedCuisines = Array.from(uniqueCuisinesMap.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const CUISINES = ["All", "Open Now", ...sortedCuisines];

  // Filter logic
  const filteredRestaurants = approvedRestaurants.filter(r => {
    if (activeFilter === "Open Now" && !r.isOpen) return false;
    if (activeFilter !== "All" && activeFilter !== "Open Now") {
      const hasCuisine = (r.cuisineTags || []).some(tag => tag.trim().toLowerCase() === activeFilter.toLowerCase());
      if (!hasCuisine) return false;
    }
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
    <div className="min-h-screen bg-background pb-24 sm:pb-8 animate-in fade-in duration-500">

      {/* Sticky header — offset by TopNavBar height on sm+ */}
      <header className="sticky top-0 sm:top-[64px] z-30 bg-background/95 backdrop-blur-xl border-b border-text-secondary/5 shadow-sm">
        <div className="page-container py-4 space-y-4">
          <h1 className="font-serif font-bold text-text-primary" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>
            Good evening
          </h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <GlassInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search restaurants, cuisines…"
              className="pl-11 rounded-full py-3 w-full bg-surface/80"
            />
          </div>

          {/* Cuisine filter chips — horizontal scroll scoped to this row only */}
          <div className="chip-row">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={(e) => {
                  setActiveFilter(cuisine);
                  e.target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`flex items-center gap-2 shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
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
        </div>
      </header>

      {/* Restaurant grid */}
      <main className="page-container pt-6">
        <section
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
        >
          {filteredRestaurants.map((restaurant) => (
            <GlassCard
              key={restaurant.id}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div
                className="relative h-44 w-full overflow-hidden bg-surface cursor-pointer"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <StatusPill status={restaurant.isOpen ? "open" : "closed"} />
                  {restaurant.isOpen && (
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-semibold">
                      <Clock className="w-3 h-3" />
                      {restaurant.deliveryWindow}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3
                  className="text-lg font-bold font-serif text-text-primary mb-1 cursor-pointer hover:text-accent transition-colors truncate"
                  title={restaurant.name}
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  {restaurant.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {restaurant.cuisineTags.map(tag => (
                    <span key={tag} className="text-xs font-medium text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-text-secondary/10">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <GlassButton
                    variant={restaurant.isOpen ? "primary" : "default"}
                    className={`flex-1 py-2 text-sm font-bold ${!restaurant.isOpen ? 'opacity-80' : ''}`}
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    {restaurant.isOpen ? 'Order Now' : 'View Menu'}
                  </GlassButton>
                  <GlassButton
                    className="flex-1 py-2 text-sm font-bold"
                    onClick={() => navigate(`/restaurant/${restaurant.id}?tab=details`)}
                  >
                    Details
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}

          {approvedRestaurants.length === 0 && (
            <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-8 col-span-full">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold font-serif text-text-primary">No spots open yet</h3>
              <p className="text-sm text-text-secondary">Our food partners are still setting up their kitchens. Please check back later!</p>
            </GlassCard>
          )}

          {approvedRestaurants.length > 0 && filteredRestaurants.length === 0 && (
            <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-8 border-dashed border-2 border-text-secondary/20 bg-surface/30 col-span-full">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-serif text-text-primary">No matching restaurants</h3>
              <p className="text-sm text-text-secondary">Try adjusting your search or filters.</p>
              {(activeFilter !== "All" || searchQuery) && (
                <GlassButton
                  variant="primary"
                  className="mt-2 py-2 px-6"
                  onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                >
                  Clear Filters
                </GlassButton>
              )}
            </GlassCard>
          )}
        </section>
      </main>

      {/* Bottom Tab Bar (mobile only — sm+ uses TopNavBar) */}
      <BottomTabBar activeTab="home" onTabChange={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
    </div>
  );
}
