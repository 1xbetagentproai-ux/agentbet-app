// src/screens/admin/AgentsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { AdminAPI } from '../../config/backendReal';
import { Card, Badge, EmptyState, BottomSheet, Button, Input, OTPInput, ConfirmBox } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

export default function AgentsScreen({ go }) {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [selected, setSelected] = useState(null);

  // Champs du formulaire d'ajout
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [actionPin, setActionPin] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const r = await AdminAPI.getAdmins();
    if (r.success) setAdmins(r.admins);
  }, []);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setName(''); setPhone(''); setPassword('');
    setNewPin(''); setConfirmPin(''); setActionPin('');
  };

  const openAdd = () => { resetForm(); setShowAdd(true); };
  const openRevoke = (admin) => { setSelected(admin); setActionPin(''); setShowRevoke(true); };

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim() || !password) {
      Alert.alert('Erreur', 'Remplissez tous les champs.');
      return;
    }
    if (newPin.length !== 4 || newPin !== confirmPin) {
      Alert.alert('Erreur', 'Les codes PIN ne correspondent pas ou sont incomplets.');
      return;
    }
    if (actionPin.length !== 4) {
      Alert.alert('Erreur', 'Saisissez votre propre PIN pour confirmer.');
      return;
    }
    setLoading(true);
    const r = await AdminAPI.createAdmin(
      { name: name.trim(), phone: phone.trim(), password, pin: newPin },
      user.id,
      actionPin
    );
    setLoading(false);
    if (!r.success) { Alert.alert('Erreur', r.error); return; }
    setShowAdd(false);
    Alert.alert('Succès', 'Nouvel administrateur créé avec succès.');
    load();
  };

  const handleRevoke = async () => {
    if (actionPin.length !== 4) { Alert.alert('Erreur', 'Saisissez votre PIN.'); return; }
    setLoading(true);
    const r = await AdminAPI.revokeAdmin(selected.id, user.id, actionPin);
    setLoading(false);
    if (!r.success) { Alert.alert('Erreur', r.error); return; }
    setShowRevoke(false);
    Alert.alert('Succès', 'Accès administrateur révoqué.');
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <View style={{ backgroundColor: Colors.blue900, paddingTop: 54, paddingBottom: SP.lg, paddingHorizontal: SP.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <TouchableOpacity onPress={() => go('settings')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon name="chevronLeft" size={18} color="rgba(255,255,255,0.85)" />
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: FS.sm }}>Retour</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Gestion des agents</Text>
        </View>
        <TouchableOpacity onPress={openAdd} style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg }}>
        <Button title="Ajouter un administrateur" onPress={openAdd} icon="shield" style={{ marginBottom: SP.lg }} />

        {admins.length === 0 ? <EmptyState icon="users" title="Aucun administrateur" /> : (
          <Card>
            {admins.map((admin, i) => {
              const isSelf = admin.id === user.id;
              const isBlocked = admin.status === 'blocked';
              return (
                <View key={admin.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: i < admins.length - 1 ? 1 : 0, borderBottomColor: Colors.gray100 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.blue50, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="shield" size={18} color={Colors.blue600} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.gray900 }}>
                      {admin.name} {isSelf && <Text style={{ color: Colors.blue500, fontSize: FS.xs }}>(Vous)</Text>}
                    </Text>
                    <Text style={{ fontSize: FS.xs, color: Colors.gray400, marginTop: 2 }}>{admin.phone}</Text>
                  </View>
                  {isBlocked ? (
                    <Badge label="Révoqué" variant="danger" />
                  ) : !isSelf ? (
                    <TouchableOpacity onPress={() => openRevoke(admin)} style={{ width: 32, height: 32, backgroundColor: Colors.red100, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="x" size={15} color={Colors.red500} />
                    </TouchableOpacity>
                  ) : (
                    <Badge label="Actif" variant="success" />
                  )}
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {/* Ajout d'un nouvel admin */}
      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un administrateur">
        <ConfirmBox message="Le nouvel administrateur aura un accès complet à la gestion des clients, transactions et statistiques." variant="info" />
        <Input label="Nom complet" placeholder="Nom de l'agent" value={name} onChangeText={setName} icon="user" autoCapitalize="words" />
        <Input label="Numéro de téléphone" placeholder="+228 90 00 00 00" value={phone} onChangeText={setPhone} icon="phone" keyboardType="phone-pad" />
        <Input label="Mot de passe" placeholder="Mot de passe sécurisé" value={password} onChangeText={setPassword} icon="lock" secureTextEntry />

        <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 4, textTransform: 'uppercase' }}>Nouveau code PIN (4 chiffres)</Text>
        <OTPInput length={4} value={newPin} onChange={setNewPin} secure />

        <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 4, textTransform: 'uppercase' }}>Confirmer le code PIN</Text>
        <OTPInput length={4} value={confirmPin} onChange={setConfirmPin} secure />

        <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 4, textTransform: 'uppercase', marginTop: 8 }}>Votre PIN (pour confirmer cette action)</Text>
        <OTPInput length={4} value={actionPin} onChange={setActionPin} secure />

        <Button title="Créer l'administrateur" onPress={handleCreate} loading={loading} icon="checkCircle" style={{ marginTop: 8, marginBottom: 10 }} />
        <Button title="Annuler" onPress={() => setShowAdd(false)} variant="ghost" />
      </BottomSheet>

      {/* Révocation */}
      <BottomSheet visible={showRevoke} onClose={() => setShowRevoke(false)} title="Révoquer l'accès">
        {selected && <>
          <ConfirmBox message={`Révoquer l'accès administrateur de ${selected.name} ? Cette personne ne pourra plus se connecter en tant qu'agent.`} variant="danger" />
          <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 4, textTransform: 'uppercase' }}>Votre PIN de confirmation</Text>
          <OTPInput length={4} value={actionPin} onChange={setActionPin} secure />
          <Button title="Confirmer la révocation" onPress={handleRevoke} loading={loading} variant="danger" icon="ban" style={{ marginBottom: 10 }} />
          <Button title="Annuler" onPress={() => setShowRevoke(false)} variant="ghost" />
        </>}
      </BottomSheet>
    </View>
  );
}
