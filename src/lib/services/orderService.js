import { db } from '../firebase';
import { 
  collection, doc, updateDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp, addDoc 
} from 'firebase/firestore';

export const orderService = {
  createOrder: async (orderData) => {
    const newOrder = {
      ...orderData,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    return { id: docRef.id, ...newOrder };
  },

  subscribeCustomerOrders: (uid, onUpdate, onError) => {
    const q = query(collection(db, 'orders'), where('customer.uid', '==', uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      onUpdate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, onError);
  },

  subscribeRestaurantOrders: (restaurantId, onUpdate, onError) => {
    const q = query(collection(db, 'orders'), where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      onUpdate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, onError);
  },

  subscribeAllOrders: (onUpdate, onError) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      onUpdate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, onError);
  },

  updateOrderStatus: async (orderId, status) => {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  },

  cancelOrder: async (orderId, currentStatus) => {
    if (currentStatus !== 'new') {
      throw new Error("Order can only be cancelled while status is 'new'");
    }
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, { status: 'cancelled', updatedAt: serverTimestamp() });
  }
};
