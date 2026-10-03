import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAsQ5zzuFrZ4pWXs0q733HuQ5vIJ7revvg",
  authDomain: "khanakro.firebaseapp.com",
  projectId: "khanakro",
  storageBucket: "khanakro.firebasestorage.app",
  messagingSenderId: "141371936837",
  appId: "1:141371936837:web:77fc63173e6e7744ff932c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (snapshot.empty) {
      console.log('No users found in DB.');
      process.exit(0);
    }
    
    snapshot.forEach(docSnap => {
      console.log('USER_DOC:', docSnap.id, JSON.stringify(docSnap.data(), null, 2));
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
