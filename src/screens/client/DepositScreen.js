// src/screens/client/DepositScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../navigation/AuthContext';
import { ClientAPI } from '../../config/backendReal';
import { uploadProofImage } from '../../config/cloudinaryUpload';
import { Button, Input, Chip, Badge } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP, RAD } from '../../config/theme';

const NETWORKS = [
  { id: 'Flooz', label: 'Flooz', sub: 'Togocel' },
  { id: 'TMoney', label: 'TMoney', sub: 'Moov Africa' },
  { id: 'MTN MoMo', label: 'MTN MoMo', sub: 'MTN' },
  { id: 'Orange Money', label: 'Orange Money', sub: 'Orange' },
];

export default function DepositScreen({ go }) {
  const { user, refreshUser } = useAuth();
  const [betId, setBetId] = useState('');
  const [network, setNetwork] = useState('Flooz');
  const [amount, setAmount] = useState('5000');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);

  const pickImage = async () => {
    Alert.alert(
      'Téléchargement de preuve',
      'Choisissez la source de votre preuve de paiement.',
      [
        { text: 'Galerie photo', onPress: () => launchPicker('gallery') },
        { text: 'Appareil photo', onPress: () => launchPicker('camera') },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const launchPicker = async (source) => {
    try {
      let permissionResult;
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert('Permission refusée', 'Autorisez l\'accès pour continuer.');
        return;
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, mediaTypes: ImagePicker.MediaTypeOptions.Images });

      if (!result.canceled && result.assets?.[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à l\'image.');
    }
  };

  const handleSubmit = async () => {
    if (!betId.trim()) { Alert.alert('Erreur', 'ID 1xBet requis.'); return; }
    if (!amount || parseInt(amount) < 500) { Alert.alert('Erreur', 'Montant minimum : 500 FCFA.'); return; }
    if (!imageUri) { Alert.alert('Preuve requise', 'Téléchargez votre preuve de paiement.'); return; }

    setStep(2);
    setUploading(true);
    const uploadResult = await uploadProofImage(imageUri);
    setUploading(false);

    if (!uploadResult.success) {
      Alert.alert('Erreur', uploadResult.error);
      setStep(1);
      return;
    }

    setLoading(true);
    const r = await ClientAPI.submitDeposit(user.id, {
      betId, network, amount: parseInt(amount), proofUrl: uploadResult.url,
    });
    setLoading(false);

    if (!r.success) { Alert.alert('Erreur', r.error); setStep(1); return; }
    await refreshUser();
    setAutoApproved(!!r.autoApproved);
    setStep(3);
  };

  if (step === 2) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <ActivityIndicator color={Colors.blue500} size="large" style={{ marginBottom: 24 }} />
        <Text style={{ fontSize: FS.lg, fontWeight: FW.bold, color: Colors.gray900, marginBottom: 8 }}>
          {uploading ? 'Envoi de la preuve...' : 'Traitement en cours'}
        </Text>
        <Text style={{ fontSize: FS.sm, color: Colors.gray400, textAlign: 'center' }}>Vérification de votre demande de dépôt</Text>
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ width: 88, height: 88, backgroundColor: Colors.green100, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name="checkCircle" size={42} color={Colors.green500} />
        </View>
        <Text style={{ fontSize: FS.xxl, fontWeight: FW.black, color: Colors.gray900, marginBottom: 12 }}>
          {autoApproved ? 'Dépôt validé' : 'Demande envoyée'}
        </Text>
        <Text style={{ fontSize: FS.base, color: Colors.gray500, textAlign: 'center', lineHeight: 24, marginBottom: 20 }}>
          {autoApproved
            ? `Votre dépôt de ${parseInt(amount).toLocaleString('fr-FR')} FCFA a été validé automatiquement.`
            : `Votre dépôt de ${parseInt(amount).toLocaleString('fr-FR')} FCFA via ${network} est en attente de validation.`
          }
        </Text>
        <Badge label={autoApproved ? 'Validé' : 'Validation en cours'} variant={autoApproved ? 'success' : 'pending'} />
        <View style={{ height: 28 }} />
        <Button
          title="Retour au tableau de bord"
          onPress={() => { setBetId(''); setAmount('5000'); setImageUri(null); setStep(1); go('dash'); }}
          variant="secondary" style={{ width: '100%' }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.white }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: Colors.blue600, paddingTop: 54, paddingBottom: 20, paddingHorizontal: SP.lg }}>
          <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Dépôt 1xBet</Text>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Alimentez votre compte de paris</Text>
        </View>

        <View style={{ padding: SP.lg }}>
          <Input label="Saisie de l'ID 1xBet" placeholder="Ex : 847392841" value={betId} onChangeText={setBetId} icon="wallet" keyboardType="numeric" />

          <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 7, textTransform: 'uppercase' }}>Choix du réseau Mobile Money</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: SP.lg }}>
            {NETWORKS.map(n => (
              <TouchableOpacity key={n.id} onPress={() => setNetwork(n.id)} style={{ width: '47%', backgroundColor: Colors.gray50, borderWidth: 2, borderColor: network === n.id ? Colors.blue500 : Colors.gray200, borderRadius: RAD.sm, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: network === n.id ? Colors.blue100 : Colors.gray200, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="wallet" size={17} color={network === n.id ? Colors.blue600 : Colors.gray500} />
                </View>
                <View><Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.gray800 }}>{n.label}</Text><Text style={{ fontSize: 10, color: Colors.gray400 }}>{n.sub}</Text></View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 7, textTransform: 'uppercase' }}>Montant du dépôt (FCFA)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {[1000, 5000, 10000, 25000, 50000].map(a => <Chip key={a} label={a.toLocaleString('fr-FR')} selected={String(a) === amount} onPress={() => setAmount(String(a))} />)}
          </View>
          <Input placeholder="Saisir un montant" value={amount} onChangeText={setAmount} keyboardType="numeric" icon="wallet" />

          <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 7, textTransform: 'uppercase', marginTop: 4 }}>Téléchargement de preuve de paiement</Text>
          <TouchableOpacity onPress={pickImage} style={{ borderWidth: 2, borderColor: imageUri ? Colors.green500 : Colors.gray300, borderStyle: 'dashed', borderRadius: RAD.sm, padding: imageUri ? 12 : 24, alignItems: 'center', backgroundColor: imageUri ? Colors.green100 : Colors.gray50, marginBottom: SP.lg, overflow: 'hidden' }}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 10 }} resizeMode="cover" />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="checkCircle" size={16} color={Colors.green500} />
                  <Text style={{ fontSize: FS.sm, fontWeight: FW.semiBold, color: Colors.green500 }}>Preuve sélectionnée — Appuyer pour changer</Text>
                </View>
              </>
            ) : (
              <>
                <Icon name="upload" size={30} color={Colors.gray400} />
                <Text style={{ fontSize: FS.sm, fontWeight: FW.semiBold, color: Colors.gray600, marginTop: 10 }}>Appuyer pour importer</Text>
                <Text style={{ fontSize: FS.xs, color: Colors.gray400, marginTop: 4 }}>Capture d'écran ou photo du reçu</Text>
              </>
            )}
          </TouchableOpacity>

          <Button title="Soumettre la demande" onPress={handleSubmit} loading={loading} icon="checkCircle" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
