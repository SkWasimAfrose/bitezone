import { 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithRedirect(auth, googleProvider);
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await ensureUserDoc(result.user);
    }
    return result;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
}

export async function signOutUser() {
  return signOut(auth);
}

export async function ensureUserDoc(user) {
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
      // New user, create document with default role
      await setDoc(docRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || null,
        role: 'student',
        createdAt: new Date()
      });
      role = 'student';
    }
    
    return role;
  } catch (error) {
    console.error("Error fetching/creating user role:", error);
    return 'student'; // fallback
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const role = await ensureUserDoc(user);
      callback(user, role);
    } else {
      callback(null, null);
    }
  });
}
