import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

async function run() {
  try {
    initializeApp({
      projectId: "khanakro"
    });
    const db = getFirestore();
    const auth = getAuth();

    const userEmail = 'wasimafrose2020@gmail.com';
    
    // First, let's get the auth user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(userEmail);
      console.log('Found Auth User UID:', userRecord.uid);
    } catch (e) {
      console.log('User not found in Auth by email:', userEmail);
    }

    let uid = userRecord?.uid;
    let docRef;

    if (uid) {
      docRef = db.collection('users').doc(uid);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        console.log('USER DOC FIELDS:');
        console.log(JSON.stringify(docSnap.data(), null, 2));
        
        await docRef.update({ role: 'superadmin' });
        console.log('Role successfully set to superadmin.');
        process.exit(0);
      } else {
        console.log('Auth user found but no document in users collection for UID:', uid);
      }
    }
    
    // Fallback: Query by email
    const q = db.collection('users').where('email', '==', userEmail);
    const snapshot = await q.get();
    
    if (snapshot.empty) {
      console.log('No user document found for email:', userEmail);
      process.exit(0);
    }
    
    for (const docSnap of snapshot.docs) {
      console.log('USER DOC FIELDS for', docSnap.id, ':');
      console.log(JSON.stringify(docSnap.data(), null, 2));
      await docSnap.ref.update({ role: 'superadmin' });
      console.log('Role updated to superadmin for', docSnap.id);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
