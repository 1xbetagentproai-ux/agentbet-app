// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Auth } from '../../config/backendReal';
import { Button, Input } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW } from '../../config/theme';

export default function RegisterScreen({ go }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrong = password.length >= 8;

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Erreur', 'Nom et numéro requis.');
      return;
    }
    if (!passwordStrong) {
      Alert.alert('Mot de passe trop faible', 'Au moins 8 caractères.');
      return;
    }
    if (password !== confirmPwd) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const r = await Auth.registerStart(name.trim(), phone.trim(), password);
    setLoading(false);

    if (!r.success) {
      Alert.alert('Erreur', r.error);
      return;
    }

    go('otp', { phone: phone.trim(), mode: 'register' });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.white }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: Colors.blue700, paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => go('login')} style={{ marginBottom: 16 }}>
            <Icon name="chevronLeft" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: FW.black, color: Colors.white }}>Créer un compte</Text>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Inscription sécurisée</Text>
        </View>
        <View style={{ padding: 24 }}>
          <Input label="Nom complet" placeholder="Jean Kouassi" value={name} onChangeText={setName} icon="user" autoCapitalize="words" />
          <Input label="Numéro de téléphone" placeholder="+228 90 00 00 00" value={phone} onChangeText={setPhone} icon="phone" keyboardType="phone-pad" />
          <Input label="Mot de passe sécurisé" placeholder="Min. 8 caractères" value={password} onChangeText={setPassword} icon="lock" secureTextEntry />
          {password.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 12 }}>
              <Icon name={passwordStrong ? 'checkCircle' : 'xCircle'} size={14} color={passwordStrong ? Colors.green500 : Colors.amber500} />
              <Text style={{ fontSize: FS.xs, color: passwordStrong ? Colors.green500 : Colors.amber500 }}>
                {passwordStrong ? 'Mot de passe sécurisé' : 'Au moins 8 caractères requis'}
              </Text>
            </View>
          )}
          <Input label="Confirmer le mot de passe" placeholder="Ressaisir le mot de passe" value={confirmPwd} onChangeText={setConfirmPwd} icon="lock" secureTextEntry />
          <Button title="Recevoir le code de vérification" onPress={handleRegister} loading={loading} icon="phone" style={{ marginBottom: 12, marginTop: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ fontSize: FS.sm, color: Colors.gray400 }}>Déjà inscrit ? </Text>
            <TouchableOpacity onPress={() => go('login')}>
              <Text style={{ fontSize: FS.sm, color: Colors.blue500, fontWeight: FW.bold }}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
