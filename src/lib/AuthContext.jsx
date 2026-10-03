import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from './auth';
import { userService } from './services/userService';

const AuthContext = createContext({
  user: null,
  role: null,
  restaurantId: null,
  loading: true,
  updateUser: async () => {},
});

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser = null;

    const unsubscribeAuth = onAuthChange(async (authUser, authRole) => {
      console.log('Auth state changed:', { authUser, authRole });
      setFirebaseUser(authUser);
      
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (authUser) {
        // First get or create the local user doc
        let localUser = await userService.getUser(authUser.uid);
        if (!localUser) {
          localUser = await userService.saveUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: null,
            role: authRole || 'student',
            savedAddress: null
          });
        }
        
        // Then subscribe to live updates for role and restaurantId
        const { db } = await import('./firebase');
        const { doc, onSnapshot } = await import('firebase/firestore');
        unsubscribeUser = onSnapshot(doc(db, 'users', authUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({ uid: authUser.uid, ...data });
            setRole(data.role || 'student');
            setRestaurantId(data.restaurantId || null);
          } else {
            setUser(null);
            setRole(null);
            setRestaurantId(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user doc:", error);
          setLoading(false);
        });

      } else {
        setUser(null);
        setRole(null);
        setRestaurantId(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const updateUser = async (updates) => {
    if (user) {
      await userService.saveUser({ ...user, ...updates });
      // setUser is handled by onSnapshot
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      restaurantId,
      loading,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
