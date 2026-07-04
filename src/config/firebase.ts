import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCFPDnCqLPYijwUofldBo82Cjvi320DdY4",
  authDomain: "slate-d1911.firebaseapp.com",
  projectId: "slate-d1911",
  storageBucket: "slate-d1911.firebasestorage.app",
  messagingSenderId: "746805170225",
  appId: "1:746805170225:web:287ff55ed6258ea6d88510",
  measurementId: "G-BC439PL7D3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
