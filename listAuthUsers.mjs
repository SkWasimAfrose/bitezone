import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAsQ5zzuFrZ4pWXs0q733HuQ5vIJ7revvg",
  authDomain: "khanakro.firebaseapp.com",
  projectId: "khanakro",
  storageBucket: "khanakro.firebasestorage.app",
  messagingSenderId: "141371936837",
  appId: "1:141371936837:web:77fc63173e6e7744ff932c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Can't list users from client SDK.
