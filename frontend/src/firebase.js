import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdbAGPZmIAFTEdoSVkSwrdP7eCVLBCAeE",
  authDomain: "placement-prep-assistant-e5bab.firebaseapp.com",
  projectId: "placement-prep-assistant-e5bab",
  storageBucket: "placement-prep-assistant-e5bab.firebasestorage.app",
  messagingSenderId: "943039669943",
  appId: "1:943039669943:web:ce19514d992e19599c8f32",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();