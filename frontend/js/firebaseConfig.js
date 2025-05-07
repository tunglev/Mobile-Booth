import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCOVU_fYzkoEobhA8lG1wl3UMSAlwPfKoY",
  authDomain: "mobile-booth-fbd4d.firebaseapp.com",
  projectId: "mobile-booth-fbd4d",
  storageBucket: "mobile-booth-fbd4d.firebasestorage.app",
  messagingSenderId: "259916876960",
  appId: "1:259916876960:web:2ade5558ad2ac459754dc5",
  measurementId: "G-KHLWPRPPW7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
const analytics = getAnalytics(app);