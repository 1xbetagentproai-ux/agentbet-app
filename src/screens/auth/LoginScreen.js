// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { Button, Input } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW } from '../../config/theme';

export default function LoginScreen({ go }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Champs requis', 'Remplissez tous les champs.');
      return;
    }
    setLoading(true);
    const r = await login(identifier.trim(), password);
    setLoading(false);
    if (!r.success) Alert.alert('Connexion échouée', r.error);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.white }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: Colors.blue600, paddingTop: 64, paddingBottom: 40, alignItems: 'center' }}>
          <View style={{ width: 72, height: 72, backgroundColor: Colors.white, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon name="shield" size={34} color={Colors.blue600} />
          </View>
          <Text style={{ fontSize: FS.xxl, fontWeight: FW.black, color: Colors.white }}>AgentBet</Text>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Dépôts · Retraits · Sécurité</Text>
        </View>
        <View style={{ padding: 24 }}>
          <Input label="Numéro de téléphone ou email" placeholder="+228 90 00 00 00" value={identifier} onChangeText={setIdentifier} icon="phone" />
          <Input label="Mot de passe" placeholder="Mot de passe sécurisé" value={password} onChangeText={setPassword} secureTextEntry icon="lock" />
          <Button title="Se connecter" onPress={handleLogin} loading={loading} icon="arrowRight" style={{ marginBottom: 12, marginTop: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: FS.sm, color: Colors.gray400 }}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => go('register')}>
              <Text style={{ fontSize: FS.sm, color: Colors.blue500, fontWeight: FW.bold }}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
