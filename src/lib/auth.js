import { 
  signInWithPopup,
  signInWithRedirect, 
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  // User creation is handled robustly in onAuthChange
  return { user: result.user };
}

export async function signOutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await Promise.race([
          getDoc(docRef),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000))
        ]);
        
        let role = 'student'; // default fallback
        
        if (docSnap.exists()) {
          role = docSnap.data().role;
        } else {
          // New user (maybe from redirect or popup), create document with default role
          await setDoc(docRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
            role: 'student',
            createdAt: new Date()
          });
          role = 'student';
        }
        
        callback(user, role);
      } catch (error) {
        console.error("Error fetching/creating user role:", error);
        callback(user, 'student');
      }
    } else {
      callback(null, null);
    }
  });
}
