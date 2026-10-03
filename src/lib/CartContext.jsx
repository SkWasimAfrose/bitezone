import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  restaurantId: null,
  items: [] // { itemId, name, price, quantity }
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { restaurantId, item } = action.payload;
      const existingItemIndex = state.items.findIndex(i => i.itemId === item.id);
      let newItems = [...state.items];
      
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex].quantity += 1;
      } else {
        newItems.push({ 
          itemId: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1 
        });
      }

      return {
        restaurantId,
        items: newItems
      };
    }
    case 'FORCE_ADD_ITEM': {
      const { restaurantId, item } = action.payload;
      return {
        restaurantId,
        items: [{ 
          itemId: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1 
        }]
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(i => i.itemId !== action.payload.itemId);
      return {
        restaurantId: newItems.length > 0 ? state.restaurantId : null,
        items: newItems
      };
    }
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
      }
      
      const newItems = state.items.map(i => 
        i.itemId === itemId ? { ...i, quantity } : i
      );
      
      return {
        ...state,
        items: newItems
      };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (restaurantId, item) => {
    if (state.restaurantId && state.restaurantId !== restaurantId) {
      if (window.confirm("Adding this item will clear your current cart from another restaurant. Continue?")) {
        dispatch({ type: 'FORCE_ADD_ITEM', payload: { restaurantId, item } });
      }
    } else {
      dispatch({ type: 'ADD_ITEM', payload: { restaurantId, item } });
    }
  };

  const removeItem = (itemId) => dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  const updateQuantity = (itemId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart: state, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
