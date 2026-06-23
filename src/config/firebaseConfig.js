// src/config/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKYOAGoJd_bDSGcqQTjBOXh_f8A_0EML8",
  authDomain: "xbet-agent-pro.firebaseapp.com",
  projectId: "xbet-agent-pro",
  storageBucket: "xbet-agent-pro.firebasestorage.app",
  messagingSenderId: "845259189666",
  appId: "1:845259189666:web:ff557a3af19992323756fb",
};

export const SMS_BACKEND_URL = "https://onexbet-sms-backend.onrender.com";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
} catch (e) {
  db = getFirestore(app);
}

export {
  app, db, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment,
};
