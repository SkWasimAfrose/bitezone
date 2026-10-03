import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const userService = {
  async getUser(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
    return null;
  },

  async saveUser(user) {
    const userRef = doc(db, 'users', user.uid);
    const userToSave = { ...user };
    if (!userToSave.createdAt) {
      userToSave.createdAt = serverTimestamp();
    }
    await setDoc(userRef, userToSave, { merge: true });
    return this.getUser(user.uid);
  },
  
  async saveAddress(uid, address) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { savedAddress: address });
  },

  async updateProfilePhoto(uid, url) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { photoURL: url });
  },

  subscribeUsers(onUpdate, onError) {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      onUpdate(users);
    }, onError);
  },

  async setUserRole(uid, role, restaurantId = null) {
    const userRef = doc(db, 'users', uid);
    const updateData = { role };
    if (role === 'restaurant_admin') {
      updateData.restaurantId = restaurantId;
    } else {
      updateData.restaurantId = null;
    }
    await updateDoc(userRef, updateData);
  }
};
