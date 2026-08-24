import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrLDdFjzm5o3DzLsa4wExe_VSyBcAoVxs",
  authDomain: "ph-salao.firebaseapp.com",
  projectId: "ph-salao",
  storageBucket: "ph-salao.firebasestorage.app",
  messagingSenderId: "623287240861",
  appId: "1:623287240861:web:e07490a2f66d3ddc6a617a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
