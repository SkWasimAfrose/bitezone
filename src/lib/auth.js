import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Check if user document already exists
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  let role = 'student';
  if (!userSnap.exists()) {
    // New user, create document with default role
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: null,
      role: 'student',
      createdAt: new Date()
    });
  } else {
    // Existing user, preserve their current role
    role = userSnap.data().role;
  }
  
  return { user, role };
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
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
        ]);
        let role = 'student'; // default fallback
        
        if (docSnap.exists()) {
          role = docSnap.data().role;
        }
        
        callback(user, role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        callback(user, 'student');
      }
    } else {
      callback(null, null);
    }
  });
}
