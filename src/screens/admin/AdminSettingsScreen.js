// src/screens/admin/AdminSettingsScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { Auth } from '../../config/backendReal';
import { Button, Input, BottomSheet, SettingsItem, ConfirmBox } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

export default function AdminSettingsScreen({ go }) {
  const { user, logout } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [logoutPwd, setLogoutPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const doChangePwd = async () => {
    if (!oldPwd || !newPwd || newPwd !== confirmPwd) { Alert.alert('Erreur', 'Vérifiez les champs.'); return; }
    setLoading(true);
    const r = await Auth.changePassword(user.id, oldPwd, newPwd);
    setLoading(false);
    if (!r.success) { Alert.alert('Erreur', r.error); return; }
    Alert.alert('Succès', 'Mot de passe mis à jour.');
    setShowPwd(false);
  };

  const doLogout = async () => {
    if (!logoutPwd) { Alert.alert('Requis'); return; }
    setLoading(true);
    const r = await Auth.login(user.email, logoutPwd);
    setLoading(false);
    if (!r.success) { Alert.alert('Erreur', 'Mot de passe incorrect.'); return; }
    setShowLogout(false);
    await logout();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <ScrollView>
        <View style={{ backgroundColor: Colors.blue900, paddingTop: 54, paddingBottom: 28, paddingHorizontal: SP.lg, alignItems: 'center' }}>
          <View style={{ width: 70, height: 70, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name="shield" size={30} color={Colors.white} />
          </View>
          <Text style={{ fontSize: FS.xl, fontWeight: FW.black, color: Colors.white }}>{user?.name}</Text>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.6)' }}>{user?.email}</Text>
          <View style={{ marginTop: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ color: Colors.white, fontSize: FS.xs, fontWeight: FW.bold }}>ADMINISTRATEUR</Text>
          </View>
        </View>
        <View style={{ backgroundColor: Colors.white, borderRadius: 14, marginHorizontal: SP.lg, marginTop: 12, overflow: 'hidden' }}>
          <SettingsItem icon="users" label="Gestion des agents" onPress={() => go('agents')} />
          <SettingsItem icon="key" label="Changer le mot de passe" onPress={() => setShowPwd(true)} last />
        </View>
        <View style={{ backgroundColor: Colors.white, borderRadius: 14, marginHorizontal: SP.lg, marginTop: 12, marginBottom: 30, overflow: 'hidden' }}>
          <SettingsItem icon="logout" label="Se déconnecter" onPress={() => setShowLogout(true)} danger last />
        </View>
      </ScrollView>
      <BottomSheet visible={showPwd} onClose={() => setShowPwd(false)} title="Changer le mot de passe">
        <Input label="Ancien mot de passe" value={oldPwd} onChangeText={setOldPwd} secureTextEntry icon="lock" />
        <Input label="Nouveau mot de passe" value={newPwd} onChangeText={setNewPwd} secureTextEntry icon="lock" />
        <Input label="Confirmer" value={confirmPwd} onChangeText={setConfirmPwd} secureTextEntry icon="lock" />
        <Button title="Mettre à jour" onPress={doChangePwd} loading={loading} icon="check" style={{ marginBottom: 10 }} />
        <Button title="Annuler" onPress={() => setShowPwd(false)} variant="ghost" />
      </BottomSheet>
      <BottomSheet visible={showLogout} onClose={() => setShowLogout(false)} title="Se déconnecter">
        <ConfirmBox message="Confirmez avec votre mot de passe administrateur." variant="danger" />
        <Input label="Mot de passe" value={logoutPwd} onChangeText={setLogoutPwd} secureTextEntry icon="lock" />
        <Button title="Confirmer la déconnexion" onPress={doLogout} loading={loading} variant="danger" icon="logout" style={{ marginBottom: 10 }} />
        <Button title="Annuler" onPress={() => setShowLogout(false)} variant="ghost" />
      </BottomSheet>
    </View>
  );
}
