import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYjzRZROER7nPX38uuIT8n76W4P36dvVg",
  authDomain: "maintenance-system-b72f9.firebaseapp.com",
  projectId: "maintenance-system-b72f9",
  storageBucket: "maintenance-system-b72f9.firebasestorage.app",
  messagingSenderId: "1063919452245",
  appId: "1:1063919452245:web:1fc13bd894e652a50254dc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);