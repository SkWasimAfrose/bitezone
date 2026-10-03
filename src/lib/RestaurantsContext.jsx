import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { restaurantService } from './services/restaurantService';
import { useAuth } from './AuthContext';

const RestaurantsContext = createContext();

export function RestaurantsProvider({ children }) {
  const { role } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(true);
  
  const menuUnsubsRef = useRef({});

  useEffect(() => {
    let unsubscribeRest = null;
    setLoading(true);

    const handleData = (data) => {
      setRestaurants(data);
      
      data.forEach(r => {
        if (!menuUnsubsRef.current[r.id]) {
          menuUnsubsRef.current[r.id] = restaurantService.subscribeMenu(r.id, (menuData) => {
            setMenus(prev => ({ ...prev, [r.id]: menuData }));
          }, (err) => console.error(err));
        }
      });
      
      setLoading(false);
    };

    if (role === 'superadmin') {
      unsubscribeRest = restaurantService.subscribeAllRestaurants(handleData, (error) => {
        console.error("Error subscribing to restaurants:", error);
        setLoading(false);
      });
    } else {
      unsubscribeRest = restaurantService.subscribeApprovedRestaurants(handleData, (error) => {
        console.error("Error subscribing to approved restaurants:", error);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribeRest) unsubscribeRest();
      Object.values(menuUnsubsRef.current).forEach(unsub => unsub());
      menuUnsubsRef.current = {};
    };
  }, [role]);

  const updateRestaurant = async (id, updates) => {
    await restaurantService.updateRestaurantInfo(id, updates);
  };

  const setOpen = async (id, isOpen) => {
    await restaurantService.setOpen(id, isOpen);
  };

  const addRestaurant = async (restaurant) => {
    return await restaurantService.addRestaurant(restaurant);
  };
  
  const setRestaurantStatus = async (id, status) => {
    await restaurantService.setRestaurantStatus(id, status);
  };

  const addMenuItem = async (restaurantId, item) => {
    return await restaurantService.addMenuItem(restaurantId, item);
  };

  const updateMenuItem = async (restaurantId, itemId, item) => {
    await restaurantService.updateMenuItem(restaurantId, itemId, item);
  };

  const deleteMenuItem = async (restaurantId, itemId) => {
    await restaurantService.deleteMenuItem(restaurantId, itemId);
  };

  // Combine restaurants with their menus
  const restaurantsWithMenus = restaurants.map(r => ({
    ...r,
    menu: menus[r.id] || []
  }));

  return (
    <RestaurantsContext.Provider value={{
      restaurants: restaurantsWithMenus,
      loading,
      updateRestaurant,
      setOpen,
      addRestaurant,
      setRestaurantStatus,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem
    }}>
      {children}
    </RestaurantsContext.Provider>
  );
}

export const useRestaurants = () => useContext(RestaurantsContext);
