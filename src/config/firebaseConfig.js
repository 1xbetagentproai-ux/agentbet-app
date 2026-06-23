// src/config/firebaseConfig.js
// ═══════════════════════════════════════════════════════════════
//  AgentBet — Configuration Firebase
//  Utilise uniquement Firestore (la connexion par mot de passe
//  est gérée manuellement dans backendReal.js, pas par Firebase Auth)
// ═══════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
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

// ── Configuration du projet Firebase ──
const firebaseConfig = {
  apiKey: "AIzaSyCKYOAGoJd_bDSGcqQTjBOXh_f8A_0EML8",
  authDomain: "xbet-agent-pro.firebaseapp.com",
  projectId: "xbet-agent-pro",
  storageBucket: "xbet-agent-pro.firebasestorage.app",
  messagingSenderId: "845259189666",
  appId: "1:845259189666:web:ff557a3af19992323756fb",
};

// ── Adresse du serveur SMS sur Render ──
export const SMS_BACKEND_URL = "https://onexbet-sms-backend.onrender.com";

// ── Initialisation Firebase (une seule fois) ──
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export {
  app, db, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment,
};
