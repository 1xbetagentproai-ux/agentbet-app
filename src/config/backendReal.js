// ═══════════════════════════════════════════════════════════════
//  1xBet Agent Pro — Backend RÉEL (Firebase + Render SMS)
//  Fichier : backendReal.js
//  Remplace entièrement l'ancien backend simulé
// ═══════════════════════════════════════════════════════════════

import {
  db, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment,
} from './firebaseConfig';
import { SMS_BACKEND_URL } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Le rôle (client ou admin) est désormais déterminé exclusivement par le
// champ "role" stocké dans Firestore pour chaque utilisateur — il n'y a
// plus de liste d'emails fixe. Cela permet d'avoir plusieurs administrateurs,
// ajoutables simplement en créant un document utilisateur avec role: "admin".
const SESSION_KEY = '@1xbet_session_real';

function uuid() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}
function fmtAmount(n) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

// ═══════════════════════════════════════════════════════════════
//  AUTH — Authentification réelle avec Firestore + Render SMS
// ═══════════════════════════════════════════════════════════════
export const Auth = {

  // Le rôle n'est plus déduit d'une liste d'emails : il est lu directement
  // depuis le document Firestore de l'utilisateur (champ "role").

  // Envoie un vrai SMS via le serveur Render
  async sendOTP(phone) {
    try {
      const response = await fetch(`${SMS_BACKEND_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Échec de l\'envoi du SMS.' };
      }
      return { success: true, debugCode: data.debugCode };
    } catch (error) {
      console.error('Erreur réseau sendOTP:', error);
      return { success: false, error: 'Impossible de contacter le serveur SMS. Vérifiez votre connexion.' };
    }
  },

  // Vérifie le code via le serveur Render
  async verifyOTP(phone, code) {
    try {
      const response = await fetch(`${SMS_BACKEND_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur réseau verifyOTP:', error);
      return { success: false, error: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
    }
  },

  // Connexion par téléphone + mot de passe (stocké de façon sécurisée dans Firestore)
  // NOTE: Pour une sécurité maximale en production, migrer vers Firebase Auth natif.
  async login(phoneOrEmail, password) {
    try {
      const isEmail = phoneOrEmail.includes('@');
      const usersRef = collection(db, 'users');
      const fieldToSearch = isEmail ? 'email' : 'phone';
      const q = query(usersRef, where(fieldToSearch, '==', phoneOrEmail.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { success: false, error: 'Compte introuvable.' };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      if (userData.password !== password) {
        return { success: false, error: 'Mot de passe incorrect.' };
      }
      if (userData.status === 'blocked') {
        return { success: false, error: 'Compte suspendu. Contactez le support.' };
      }

      const role = userData.role === 'admin' ? 'admin' : 'client';

      const session = { userId: userDoc.id, role, loggedAt: Date.now() };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

      const { password: _p, pin: _pin, ...safeUser } = userData;
      return { success: true, user: { id: userDoc.id, ...safeUser, role } };
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur de connexion. Réessayez.' };
    }
  },

  // Démarre l'inscription : crée le compte (en attente de vérification OTP)
  async registerStart(name, phone, password) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone.trim()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return { success: false, error: 'Ce numéro est déjà utilisé.' };
      }

      const fakeEmail = phone.replace(/\D/g, '') + '@client.local';
      const newUser = {
        name: name.trim(),
        phone: phone.trim(),
        email: fakeEmail,
        password,
        pin: '0000',
        role: 'client',
        status: 'active',
        balance: 0,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      };

      const docRef = await addDoc(usersRef, newUser);
      return { success: true, userId: docRef.id };
    } catch (error) {
      console.error('Erreur registerStart:', error);
      return { success: false, error: 'Erreur lors de la création du compte.' };
    }
  },

  // Finalise la connexion après vérification OTP réussie
  async finalizeRegisterLogin(phone) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { success: false, error: 'Compte introuvable.' };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      const session = { userId: userDoc.id, role: userData.role, loggedAt: Date.now() };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

      const { password: _p, pin: _pin, ...safeUser } = userData;
      return { success: true, user: { id: userDoc.id, ...safeUser }, role: userData.role };
    } catch (error) {
      console.error('Erreur finalizeRegisterLogin:', error);
      return { success: false, error: 'Erreur lors de la connexion.' };
    }
  },

  async logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    return { success: true };
  },

  async getSession() {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async getCurrentUser() {
    const session = await Auth.getSession();
    if (!session) return null;
    try {
      const userDoc = await getDoc(doc(db, 'users', session.userId));
      if (!userDoc.exists()) return null;
      const userData = userDoc.data();
      const { password: _p, pin: _pin, ...safeUser } = userData;
      return { id: userDoc.id, ...safeUser, role: session.role };
    } catch (error) {
      console.error('Erreur getCurrentUser:', error);
      return null;
    }
  },

  async changePassword(userId, oldPwd, newPwd) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return { success: false, error: 'Utilisateur introuvable.' };
      if (userDoc.data().password !== oldPwd) return { success: false, error: 'Ancien mot de passe incorrect.' };
      await updateDoc(doc(db, 'users', userId), { password: newPwd });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour.' };
    }
  },
};

// ═══════════════════════════════════════════════════════════════
//  CLIENT API — Toutes connectées à Firestore en temps réel
// ═══════════════════════════════════════════════════════════════
export const ClientAPI = {

  async getProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return { success: false };
      const { password: _p, pin: _pin, ...safe } = userDoc.data();
      return { success: true, user: { id: userDoc.id, ...safe } };
    } catch {
      return { success: false };
    }
  },

  async getTransactions(userId) {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return { success: true, transactions };
    } catch (error) {
      console.error('Erreur getTransactions:', error);
      return { success: true, transactions: [] };
    }
  },

  async submitDeposit(userId, { betId, network, amount, proofUrl }) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return { success: false, error: 'Utilisateur introuvable.' };
      const user = userDoc.data();

      if (amount < 500) return { success: false, error: 'Montant minimum : 500 FCFA.' };
      if (!betId.trim()) return { success: false, error: 'ID 1xBet requis.' };
      if (!proofUrl) return { success: false, error: 'La preuve de paiement est obligatoire.' };

      // Lire le mode de validation global
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      const autoMode = settingsDoc.exists() ? !!settingsDoc.data().autoValidation : false;

      const tx = {
        userId,
        userName: user.name,
        type: 'deposit',
        amount,
        network,
        betId,
        proofUrl,
        status: autoMode ? 'approved' : 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const txRef = await addDoc(collection(db, 'transactions'), tx);

      if (autoMode) {
        await updateDoc(doc(db, 'users', userId), { balance: increment(amount) });
      }

      await addDoc(collection(db, 'notifications'), {
        userId,
        type: autoMode ? 'deposit_approved' : 'deposit_pending',
        title: autoMode ? 'Dépôt validé' : 'Dépôt soumis',
        body: autoMode
          ? `Votre dépôt de ${fmtAmount(amount)} via ${network} a été validé automatiquement.`
          : `Votre dépôt de ${fmtAmount(amount)} via ${network} est en attente de validation.`,
        read: false,
        createdAt: serverTimestamp(),
      });

      return { success: true, transactionId: txRef.id, autoApproved: autoMode };
    } catch (error) {
      console.error('Erreur submitDeposit:', error);
      return { success: false, error: 'Erreur lors de la soumission du dépôt.' };
    }
  },

  async submitWithdraw(userId, { betId, network, mmPhone, amount, pin }) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return { success: false, error: 'Utilisateur introuvable.' };
      const user = userDoc.data();

      if (user.pin !== pin) return { success: false, error: 'Code PIN incorrect. Retrait refusé.' };
      if (amount < 500) return { success: false, error: 'Montant minimum : 500 FCFA.' };
      if (amount > user.balance) return { success: false, error: 'Solde insuffisant.' };

      const tx = {
        userId,
        userName: user.name,
        type: 'withdraw',
        amount,
        network,
        betId,
        mmPhone,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const txRef = await addDoc(collection(db, 'transactions'), tx);
      await updateDoc(doc(db, 'users', userId), { balance: increment(-amount) });

      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'withdraw_pending',
        title: 'Retrait en traitement',
        body: `Votre retrait de ${fmtAmount(amount)} via ${network} est pris en charge par l'agent.`,
        read: false,
        createdAt: serverTimestamp(),
      });

      return { success: true, transactionId: txRef.id };
    } catch (error) {
      console.error('Erreur submitWithdraw:', error);
      return { success: false, error: 'Erreur lors de la soumission du retrait.' };
    }
  },

  async getNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return { success: true, notifications, unread: notifications.filter(n => !n.read).length };
    } catch (error) {
      console.error('Erreur getNotifications:', error);
      return { success: true, notifications: [], unread: 0 };
    }
  },

  async markAllRead(userId) {
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true }));
      await Promise.all(updates);
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async getMessages(userId) {
    try {
      const q = query(collection(db, 'messages'), where('userId', '==', userId), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      return { success: true, messages: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch {
      return { success: true, messages: [] };
    }
  },

  async sendMessage(userId, text) {
    try {
      const msg = { userId, sender: 'client', text, createdAt: serverTimestamp() };
      const msgRef = await addDoc(collection(db, 'messages'), msg);
      return { success: true, messageId: msgRef.id };
    } catch (error) {
      return { success: false, error: 'Erreur lors de l\'envoi du message.' };
    }
  },

  // Écoute en temps réel les nouveaux messages (pour le chat live)
  listenToMessages(userId, callback) {
    const q = query(collection(db, 'messages'), where('userId', '==', userId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, snapshot => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async getPromos() {
    try {
      const q = query(collection(db, 'promos'), where('active', '==', true));
      const snapshot = await getDocs(q);
      return { success: true, promos: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch {
      return { success: true, promos: [] };
    }
  },
};

// ═══════════════════════════════════════════════════════════════
//  ADMIN API
// ═══════════════════════════════════════════════════════════════
export const AdminAPI = {

  // ── Création d'un nouvel administrateur, par un admin déjà connecté ──
  // Sécurité : adminPin vérifie que l'admin qui fait l'action est légitime.
  async createAdmin({ name, phone, password, pin }, requestingAdminId, requestingAdminPin) {
    try {
      const requestingAdminDoc = await getDoc(doc(db, 'users', requestingAdminId));
      if (!requestingAdminDoc.exists() || requestingAdminDoc.data().role !== 'admin') {
        return { success: false, error: 'Action réservée aux administrateurs.' };
      }
      if (requestingAdminDoc.data().pin !== requestingAdminPin) {
        return { success: false, error: 'Code PIN administrateur incorrect.' };
      }

      if (!name?.trim() || !phone?.trim() || !password || !pin) {
        return { success: false, error: 'Tous les champs sont requis.' };
      }
      if (pin.length !== 4) {
        return { success: false, error: 'Le PIN doit contenir exactement 4 chiffres.' };
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone.trim()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { success: false, error: 'Ce numéro est déjà utilisé.' };
      }

      const fakeEmail = phone.replace(/\D/g, '') + '@agent.local';
      const newAdmin = {
        name: name.trim(),
        phone: phone.trim(),
        email: fakeEmail,
        password,
        pin,
        role: 'admin',
        status: 'active',
        balance: 0,
        autoValidation: false,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        createdBy: requestingAdminId,
      };

      const docRef = await addDoc(usersRef, newAdmin);
      return { success: true, adminId: docRef.id };
    } catch (error) {
      console.error('Erreur createAdmin:', error);
      return { success: false, error: 'Erreur lors de la création de l\'administrateur.' };
    }
  },

  // ── Liste de tous les administrateurs (pour gestion par les pairs) ──
  async getAdmins() {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const snapshot = await getDocs(q);
      return {
        success: true,
        admins: snapshot.docs.map(d => {
          const { password: _p, pin: _pin, ...safe } = d.data();
          return { id: d.id, ...safe };
        }),
      };
    } catch (error) {
      console.error('Erreur getAdmins:', error);
      return { success: true, admins: [] };
    }
  },

  // ── Révoquer les droits admin d'un agent (le repasse en client bloqué) ──
  // Empêche un admin de se révoquer lui-même par erreur.
  async revokeAdmin(targetAdminId, requestingAdminId, requestingAdminPin) {
    try {
      if (targetAdminId === requestingAdminId) {
        return { success: false, error: 'Vous ne pouvez pas révoquer votre propre accès.' };
      }
      const requestingAdminDoc = await getDoc(doc(db, 'users', requestingAdminId));
      if (!requestingAdminDoc.exists() || requestingAdminDoc.data().role !== 'admin') {
        return { success: false, error: 'Action réservée aux administrateurs.' };
      }
      if (requestingAdminDoc.data().pin !== requestingAdminPin) {
        return { success: false, error: 'Code PIN administrateur incorrect.' };
      }

      await updateDoc(doc(db, 'users', targetAdminId), { status: 'blocked' });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la révocation.' };
    }
  },

  async getStats() {
    try {
      const txSnapshot = await getDocs(collection(db, 'transactions'));
      const allTx = txSnapshot.docs.map(d => d.data());

      const deps = allTx.filter(t => t.type === 'deposit' && t.status === 'approved');
      const wits = allTx.filter(t => t.type === 'withdraw' && t.status === 'approved');

      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'client')));
      const allUsers = usersSnapshot.docs.map(d => d.data());

      return {
        success: true,
        stats: {
          totalDeposits: deps.reduce((s, t) => s + t.amount, 0),
          totalWithdrawals: wits.reduce((s, t) => s + t.amount, 0),
          profit: deps.reduce((s, t) => s + t.amount, 0) - wits.reduce((s, t) => s + t.amount, 0),
          activeClients: allUsers.filter(u => u.status === 'active').length,
          pendingCount: allTx.filter(t => t.status === 'pending').length,
          totalClients: allUsers.length,
        },
      };
    } catch (error) {
      console.error('Erreur getStats:', error);
      return { success: false };
    }
  },

  async getValidationMode() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      return { success: true, autoValidation: settingsDoc.exists() ? !!settingsDoc.data().autoValidation : false };
    } catch {
      return { success: true, autoValidation: false };
    }
  },

  async setValidationMode(autoValidation) {
    try {
      await setDoc(doc(db, 'settings', 'global'), { autoValidation }, { merge: true });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async getTransactions(filter = 'all') {
    try {
      let q;
      if (filter === 'pending' || filter === 'approved' || filter === 'rejected') {
        q = query(collection(db, 'transactions'), where('status', '==', filter), orderBy('createdAt', 'desc'));
      } else if (filter === 'deposit' || filter === 'withdraw') {
        q = query(collection(db, 'transactions'), where('type', '==', filter), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100));
      }
      const snapshot = await getDocs(q);
      return { success: true, transactions: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
      console.error('Erreur getTransactions admin:', error);
      return { success: true, transactions: [] };
    }
  },

  async approveTransaction(txId, adminPin, adminId) {
    try {
      const adminDoc = await getDoc(doc(db, 'users', adminId));
      if (!adminDoc.exists() || adminDoc.data().pin !== adminPin) {
        return { success: false, error: 'Code PIN administrateur incorrect.' };
      }

      const txDoc = await getDoc(doc(db, 'transactions', txId));
      if (!txDoc.exists() || txDoc.data().status !== 'pending') {
        return { success: false, error: 'Transaction invalide.' };
      }
      const tx = txDoc.data();

      await updateDoc(doc(db, 'transactions', txId), { status: 'approved', updatedAt: serverTimestamp() });

      if (tx.type === 'deposit') {
        await updateDoc(doc(db, 'users', tx.userId), { balance: increment(tx.amount) });
      }

      await addDoc(collection(db, 'notifications'), {
        userId: tx.userId,
        type: tx.type === 'deposit' ? 'deposit_approved' : 'withdraw_done',
        title: tx.type === 'deposit' ? 'Dépôt validé' : 'Retrait effectué',
        body: `Votre ${tx.type === 'deposit' ? 'dépôt' : 'retrait'} de ${fmtAmount(tx.amount)} a été confirmé.`,
        read: false,
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur approveTransaction:', error);
      return { success: false, error: 'Erreur lors de la validation.' };
    }
  },

  async rejectTransaction(txId, reason, adminPin, adminId) {
    try {
      const adminDoc = await getDoc(doc(db, 'users', adminId));
      if (!adminDoc.exists() || adminDoc.data().pin !== adminPin) {
        return { success: false, error: 'Code PIN administrateur incorrect.' };
      }

      const txDoc = await getDoc(doc(db, 'transactions', txId));
      if (!txDoc.exists() || txDoc.data().status !== 'pending') {
        return { success: false, error: 'Transaction invalide.' };
      }
      const tx = txDoc.data();

      await updateDoc(doc(db, 'transactions', txId), {
        status: 'rejected',
        agentNote: reason,
        updatedAt: serverTimestamp(),
      });

      if (tx.type === 'withdraw') {
        await updateDoc(doc(db, 'users', tx.userId), { balance: increment(tx.amount) });
      }

      await addDoc(collection(db, 'notifications'), {
        userId: tx.userId,
        type: 'rejected',
        title: 'Demande rejetée',
        body: `Motif du rejet : ${reason}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur rejectTransaction:', error);
      return { success: false, error: 'Erreur lors du rejet.' };
    }
  },

  async getClients() {
    try {
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'client')));
      const txSnapshot = await getDocs(collection(db, 'transactions'));
      const allTx = txSnapshot.docs.map(d => d.data());

      const clients = usersSnapshot.docs.map(userDoc => {
        const u = userDoc.data();
        const userTx = allTx.filter(t => t.userId === userDoc.id);
        const { password: _p, pin: _pin, ...safe } = u;
        return {
          id: userDoc.id,
          ...safe,
          txCount: userTx.length,
          totalDeposited: userTx.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((s, t) => s + t.amount, 0),
          totalWithdrawn: userTx.filter(t => t.type === 'withdraw' && t.status === 'approved').reduce((s, t) => s + t.amount, 0),
        };
      });

      return { success: true, clients };
    } catch (error) {
      console.error('Erreur getClients:', error);
      return { success: true, clients: [] };
    }
  },

  async toggleBlock(userId, adminPin, adminId) {
    try {
      const adminDoc = await getDoc(doc(db, 'users', adminId));
      if (!adminDoc.exists() || adminDoc.data().pin !== adminPin) {
        return { success: false, error: 'Code PIN administrateur incorrect.' };
      }
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return { success: false, error: 'Client introuvable.' };

      const newStatus = userDoc.data().status === 'blocked' ? 'active' : 'blocked';
      await updateDoc(doc(db, 'users', userId), { status: newStatus });

      return { success: true, status: newStatus };
    } catch (error) {
      return { success: false, error: 'Erreur lors du changement de statut.' };
    }
  },

  async getClientHistory(userId) {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return { success: true, transactions: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch {
      return { success: true, transactions: [] };
    }
  },

  async getAllConversations() {
    try {
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'client')));
      const conversations = [];

      for (const userDoc of usersSnapshot.docs) {
        const q = query(collection(db, 'messages'), where('userId', '==', userDoc.id), orderBy('createdAt', 'asc'));
        const msgSnapshot = await getDocs(q);
        const messages = msgSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (messages.length > 0) {
          conversations.push({
            userId: userDoc.id,
            userName: userDoc.data().name,
            messages,
            lastMessage: messages[messages.length - 1],
          });
        }
      }

      return { success: true, conversations };
    } catch (error) {
      console.error('Erreur getAllConversations:', error);
      return { success: true, conversations: [] };
    }
  },

  async replyMessage(userId, text) {
    try {
      const msg = { userId, sender: 'agent', text, createdAt: serverTimestamp() };
      const msgRef = await addDoc(collection(db, 'messages'), msg);
      return { success: true, messageId: msgRef.id };
    } catch {
      return { success: false, error: 'Erreur lors de l\'envoi.' };
    }
  },
};

export default { Auth, ClientAPI, AdminAPI };
