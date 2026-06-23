// src/navigation/AppNavigator.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from './AuthContext';
import Icon from '../components/Icon';
import { Colors, FS, FW } from '../config/theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Client screens
import DashboardScreen from '../screens/client/DashboardScreen';
import DepositScreen from '../screens/client/DepositScreen';
import WithdrawScreen from '../screens/client/WithdrawScreen';
import NotifScreen from '../screens/client/NotifScreen';
import SupportScreen from '../screens/client/SupportScreen';
import HistoryScreen from '../screens/client/HistoryScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

// Admin screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import TransactionsScreen from '../screens/admin/TransactionsScreen';
import ClientsScreen from '../screens/admin/ClientsScreen';
import MessagesScreen from '../screens/admin/MessagesScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AgentsScreen from '../screens/admin/AgentsScreen';

// ── Navigation simple par état (sans react-navigation pour limiter les dépendances natives) ──

function ClientApp() {
  const [screen, setScreen] = useState('dash');
  const [params, setParams] = useState(null);
  const navigate = (s, p) => { setScreen(s); setParams(p); };

  const screens = {
    dash: DashboardScreen, deposit: DepositScreen, withdraw: WithdrawScreen,
    notifs: NotifScreen, support: SupportScreen, history: HistoryScreen, profile: ProfileScreen,
  };
  const Screen = screens[screen] || DashboardScreen;
  const tabs = [
    ['dash', 'home', 'Accueil'], ['deposit', 'deposit', 'Dépôt'], ['withdraw', 'withdraw', 'Retrait'],
    ['notifs', 'bell', 'Notifications'], ['support', 'chat', 'Support'],
  ];
  const showTabs = ['dash', 'deposit', 'withdraw', 'notifs', 'support'].includes(screen);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={{ flex: 1 }}><Screen go={navigate} params={params} /></View>
      {showTabs && (
        <View style={{ flexDirection: 'row', backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray200, paddingBottom: 18, paddingTop: 10 }}>
          {tabs.map(([id, icon, label]) => (
            <TouchableOpacity key={id} onPress={() => navigate(id)} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Icon name={icon} size={21} color={screen === id ? Colors.blue500 : Colors.gray400} />
              <Text style={{ fontSize: 10, fontWeight: FW.semiBold, color: screen === id ? Colors.blue500 : Colors.gray400 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function AdminApp() {
  const [screen, setScreen] = useState('dash');
  const screens = {
    dash: AdminDashboard, transactions: TransactionsScreen, clients: ClientsScreen,
    messages: MessagesScreen, settings: AdminSettingsScreen, agents: AgentsScreen,
  };
  const Screen = screens[screen] || AdminDashboard;
  const tabs = [
    ['dash', 'chart', 'Tableau'], ['transactions', 'list', 'Transactions'], ['clients', 'users', 'Clients'],
    ['messages', 'chat', 'Messages'], ['settings', 'settings', 'Réglages'],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={{ flex: 1 }}><Screen go={setScreen} /></View>
      <View style={{ flexDirection: 'row', backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray200, paddingBottom: 18, paddingTop: 10 }}>
        {tabs.map(([id, icon, label]) => (
          <TouchableOpacity key={id} onPress={() => setScreen(id)} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Icon name={icon} size={21} color={screen === id ? Colors.blue500 : Colors.gray400} />
            <Text style={{ fontSize: 10, fontWeight: FW.semiBold, color: screen === id ? Colors.blue500 : Colors.gray400 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function AuthStack() {
  const [authScreen, setAuthScreen] = useState('login');
  const [authParams, setAuthParams] = useState(null);
  const navigate = (s, p) => { setAuthScreen(s); setAuthParams(p); };

  if (authScreen === 'register') return <RegisterScreen go={navigate} />;
  if (authScreen === 'otp') return <OTPScreen go={navigate} params={authParams} />;
  return <LoginScreen go={navigate} />;
}

export default function AppNavigator() {
  const { user, role } = useAuth();

  if (!user) return <AuthStack />;
  return role === 'admin' ? <AdminApp /> : <ClientApp />;
}
