// src/screens/client/WithdrawScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { ClientAPI } from '../../config/backendReal';
import { Button, Input, Chip, BottomSheet, OTPInput, ConfirmBox, Badge } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

const NETWORKS = ['Flooz', 'TMoney', 'MTN MoMo', 'Orange Money'];

export default function WithdrawScreen({ go }) {
  const { user, refreshUser } = useAuth();
  const [betId, setBetId] = useState('');
  const [network, setNetwork] = useState('Flooz');
  const [mmPhone, setMmPhone] = useState('');
  const [amount, setAmount] = useState('5000');
  const [pin, setPin] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const openConfirm = () => {
    if (!betId.trim() || !mmPhone.trim()) { Alert.alert('Erreur', 'Remplissez tous les champs.'); return; }
    if (!amount || parseInt(amount) < 500) { Alert.alert('Erreur', 'Montant minimum 500 FCFA.'); return; }
    if (parseInt(amount) > (user?.balance || 0)) { Alert.alert('Erreur', 'Solde insuffisant.'); return; }
    setPin(''); setShowConfirm(true);
  };

  const executeWithdraw = async () => {
    if (pin.length < 4) { Alert.alert('Code PIN requis', 'Saisissez les 4 chiffres.'); return; }
    setLoading(true);
    const r = await ClientAPI.submitWithdraw(user.id, { betId, network, mmPhone, amount: parseInt(amount), pin });
    setLoading(false); setShowConfirm(false);
    if (!r.success) { Alert.alert('Erreur', r.error); return; }
    await refreshUser(); setDone(true);
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ width: 88, height: 88, backgroundColor: Colors.amber100, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name="clock" size={40} color={Colors.amber500} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: FW.black, color: Colors.gray900, marginBottom: 10 }}>Retrait en traitement</Text>
        <Text style={{ fontSize: FS.base, color: Colors.gray500, textAlign: 'center', marginBottom: 24 }}>
          Votre retrait de {parseInt(amount).toLocaleString('fr-FR')} FCFA est pris en charge par l'agent.
        </Text>
        <Badge label="En attente de l'agent" variant="pending" />
        <View style={{ height: 24 }} />
        <Button
          title="Retour au tableau de bord"
          onPress={() => { setBetId(''); setMmPhone(''); setAmount('5000'); setDone(false); go('dash'); }}
          variant="secondary" style={{ width: '100%' }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.white }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: Colors.blue700, paddingTop: 54, paddingBottom: 20, paddingHorizontal: SP.lg }}>
          <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Retrait 1xBet</Text>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Recevez vos gains par Mobile Money</Text>
        </View>
        <View style={{ padding: SP.lg }}>
          <ConfirmBox message="Effectuez d'abord votre retrait sur la plateforme 1xBet, puis remplissez ce formulaire pour recevoir vos fonds." />
          <Input label="Saisie de l'ID 1xBet" placeholder="Ex : 847392841" value={betId} onChangeText={setBetId} icon="wallet" keyboardType="numeric" />
          <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 7, textTransform: 'uppercase' }}>Réseau Mobile Money</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SP.md }}>
            {NETWORKS.map(n => <Chip key={n} label={n} selected={network === n} onPress={() => setNetwork(n)} />)}
          </View>
          <Input label="Numéro Mobile Money de réception" placeholder="+228 90 00 00 00" value={mmPhone} onChangeText={setMmPhone} icon="phone" keyboardType="phone-pad" />
          <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 7, textTransform: 'uppercase' }}>Montant demandé (FCFA)</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            {[2000, 5000, 10000, 20000].map(a => <Chip key={a} label={a.toLocaleString('fr-FR')} selected={String(a) === amount} onPress={() => setAmount(String(a))} />)}
          </View>
          <Input placeholder="Saisir un montant" value={amount} onChangeText={setAmount} keyboardType="numeric" icon="wallet" />
          <Button title="Confirmer le retrait" onPress={openConfirm} icon="withdraw" style={{ marginTop: 8 }} />
        </View>
      </ScrollView>

      <BottomSheet visible={showConfirm} onClose={() => setShowConfirm(false)} title="Confirmer le retrait">
        <ConfirmBox message={`Réseau : ${network}\nNuméro : ${mmPhone}\nMontant : ${parseInt(amount || 0).toLocaleString('fr-FR')} FCFA`} variant="warning" />
        <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 4, textTransform: 'uppercase' }}>Code PIN de sécurité</Text>
        <OTPInput length={4} value={pin} onChange={setPin} secure />
        <Button title="Valider le retrait" onPress={executeWithdraw} loading={loading} variant="danger" icon="checkCircle" style={{ marginBottom: 10 }} />
        <Button title="Annuler" onPress={() => setShowConfirm(false)} variant="ghost" icon="x" />
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
