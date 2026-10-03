import { createContext, useContext, useState, useEffect } from 'react';
import { orderService } from './services/orderService';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user, role, restaurantId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    if (role === 'superadmin') {
      unsubscribe = orderService.subscribeAllOrders((data) => {
        setOrders(data);
        setLoading(false);
      }, (error) => {
        console.error("Error subscribing to all orders:", error);
        setLoading(false);
      });
    } else if (role === 'restaurant_admin' && restaurantId) {
      unsubscribe = orderService.subscribeRestaurantOrders(restaurantId, (data) => {
        setOrders(data);
        setLoading(false);
      }, (error) => {
        console.error("Error subscribing to restaurant orders:", error);
        setLoading(false);
      });
    } else {
      unsubscribe = orderService.subscribeCustomerOrders(user.uid, (data) => {
        setOrders(data);
        setLoading(false);
      }, (error) => {
        console.error("Error subscribing to customer orders:", error);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, role, restaurantId]);

  const placeOrder = async (orderData) => {
    return await orderService.createOrder(orderData);
  };

  const updateOrderStatus = async (orderId, status) => {
    await orderService.updateOrderStatus(orderId, status);
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      loading,
      refresh: () => {}, // No-op as subscriptions are live
      placeOrder,
      updateOrderStatus
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
