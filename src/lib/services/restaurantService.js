import { db } from '../firebase';
import { 
  collection, doc, updateDoc, deleteDoc, 
  query, where, onSnapshot, serverTimestamp, addDoc 
} from 'firebase/firestore';

export const restaurantService = {
  subscribeApprovedRestaurants(onUpdate, onError) {
    const q = query(collection(db, 'restaurants'), where('status', '==', 'approved'));
    return onSnapshot(q, (snapshot) => {
      const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(restaurants);
    }, onError);
  },

  subscribeAllRestaurants(onUpdate, onError) {
    return onSnapshot(collection(db, 'restaurants'), (snapshot) => {
      const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(restaurants);
    }, onError);
  },

  subscribeRestaurant(id, onUpdate, onError) {
    return onSnapshot(doc(db, 'restaurants', id), (doc) => {
      if (doc.exists()) {
        onUpdate({ id: doc.id, ...doc.data() });
      } else {
        onUpdate(null);
      }
    }, onError);
  },

  subscribeMenu(restaurantId, onUpdate, onError) {
    return onSnapshot(collection(db, 'restaurants', restaurantId, 'menu'), (snapshot) => {
      const menu = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(menu);
    }, onError);
  },

  async setOpen(restaurantId, isOpen) {
    const ref = doc(db, 'restaurants', restaurantId);
    await updateDoc(ref, { isOpen, updatedAt: serverTimestamp() });
  },

  async updateRestaurantInfo(restaurantId, updates) {
    const ref = doc(db, 'restaurants', restaurantId);
    const allowed = ['isOpen', 'phone', 'address', 'description', 'deliveryWindows', 'imageUrl', 'name', 'ownerName', 'mapEmbedUrl', 'cuisineTags'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }
    safeUpdates.updatedAt = serverTimestamp();
    await updateDoc(ref, safeUpdates);
  },

  async addRestaurant(restaurant) {
    const newRest = {
      status: 'approved',
      isOpen: false,
      ...restaurant,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const ref = await addDoc(collection(db, 'restaurants'), newRest);
    return ref.id;
  },

  async setRestaurantStatus(restaurantId, status) {
    const ref = doc(db, 'restaurants', restaurantId);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  },

  async addMenuItem(restaurantId, item) {
    const ref = await addDoc(collection(db, 'restaurants', restaurantId, 'menu'), item);
    return { id: ref.id, ...item };
  },

  async updateMenuItem(restaurantId, itemId, item) {
    const ref = doc(db, 'restaurants', restaurantId, 'menu', itemId);
    await updateDoc(ref, item);
  },

  async deleteMenuItem(restaurantId, itemId) {
    const ref = doc(db, 'restaurants', restaurantId, 'menu', itemId);
    await deleteDoc(ref);
  }
};
