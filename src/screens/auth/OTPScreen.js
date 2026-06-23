// src/screens/auth/OTPScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Auth } from '../../config/backendReal';
import { useAuth } from '../../navigation/AuthContext';
import { Button, OTPInput } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW } from '../../config/theme';

export default function OTPScreen({ go, params }) {
  const { loginAfterRegister } = useAuth();
  const phone = params?.phone || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [debugCode, setDebugCode] = useState('');

  useEffect(() => {
    sendCode();
    const timer = setInterval(() => setCountdown(c => (c <= 1 ? (clearInterval(timer), 0) : c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const sendCode = async () => {
    setSending(true);
    const r = await Auth.sendOTP(phone);
    setSending(false);
    if (!r.success) {
      Alert.alert('Erreur d\'envoi', r.error);
      return;
    }
    if (r.debugCode) setDebugCode(r.debugCode);
    setCountdown(60);
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert('Code incomplet', 'Saisissez les 6 chiffres reçus par SMS.');
      return;
    }
    setLoading(true);
    const r = await Auth.verifyOTP(phone, code);
    setLoading(false);
    if (!r.success) {
      Alert.alert('Erreur', r.error);
      return;
    }
    const loginResult = await loginAfterRegister(phone);
    if (!loginResult.success) {
      Alert.alert('Erreur', loginResult.error || 'Erreur de connexion.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.white }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: Colors.blue600, paddingTop: 64, paddingBottom: 36, alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon name="phone" size={28} color={Colors.white} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: FW.black, color: Colors.white, marginBottom: 6 }}>Vérification SMS</Text>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.7)' }}>Code envoyé au</Text>
          <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: Colors.white, marginTop: 2 }}>{phone}</Text>
        </View>
        <View style={{ padding: 24 }}>
          {sending && (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: FS.sm, color: Colors.gray400 }}>Envoi du SMS en cours...</Text>
            </View>
          )}
          {debugCode ? (
            <View style={{ backgroundColor: Colors.amber100, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: Colors.amber500 }}>
              <Text style={{ fontSize: FS.xs, color: '#92400E', fontWeight: FW.bold, textTransform: 'uppercase' }}>Mode débogage</Text>
              <Text style={{ fontSize: 22, fontWeight: FW.black, color: '#92400E', letterSpacing: 6, marginVertical: 6 }}>{debugCode}</Text>
              <Text style={{ fontSize: FS.xs, color: '#92400E', textAlign: 'center' }}>Visible uniquement en environnement de test</Text>
            </View>
          ) : null}
          <OTPInput length={6} value={code} onChange={setCode} />
          <Button title="Valider le code" onPress={handleVerify} loading={loading} icon="checkCircle" style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: FS.sm, color: Colors.gray400 }}>Code non reçu ? </Text>
            {countdown > 0
              ? <Text style={{ fontSize: FS.sm, color: Colors.gray400 }}>Renvoyer dans {countdown}s</Text>
              : <TouchableOpacity onPress={sendCode}><Text style={{ fontSize: FS.sm, color: Colors.blue500, fontWeight: FW.bold }}>Renvoyer le code</Text></TouchableOpacity>
            }
          </View>
          <TouchableOpacity onPress={() => go('login')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: FS.sm, color: Colors.gray400 }}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
