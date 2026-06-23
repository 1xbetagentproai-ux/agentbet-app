// src/screens/admin/ClientsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { AdminAPI } from '../../config/backendReal';
import { Card, Badge, EmptyState, BottomSheet, Button, InfoRow, OTPInput, ConfirmBox, Chip } from '../../components/UI';
import { TxRow } from '../client/DashboardScreen';
import { AVATAR_COLORS } from './AdminDashboard';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

export default function ClientsScreen({ go }) {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [showBlock, setShowBlock] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => { const r = await AdminAPI.getClients(); if (r.success) setClients(r.clients); }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const openDetail = c => { setSelected(c); setShowDetail(true); };
  const openHistory = async c => {
    setSelected(c); setShowDetail(false);
    const r = await AdminAPI.getClientHistory(c.id);
    if (r.success) setHistory(r.transactions);
    setTimeout(() => setShowHistory(true), 250);
  };
  const openBlock = c => { setSelected(c); setPin(''); setShowDetail(false); setTimeout(() => setShowBlock(true), 250); };

  const doToggleBlock = async () => {
    if (pin.length < 4) { Alert.alert('Code PIN requis'); return; }
    setLoading(true);
    const r = await AdminAPI.toggleBlock(selected.id, pin, user.id);
    setLoading(false);
    if (!r.success) { Alert.alert('Erreur', r.error); return; }
    setShowBlock(false);
    Alert.alert('Succès', `Client ${r.status === 'blocked' ? 'bloqué' : 'débloqué'} avec succès.`);
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <View style={{ backgroundColor: Colors.blue900, paddingTop: 54, paddingBottom: SP.lg, paddingHorizontal: SP.lg }}>
        <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Gestion des clients</Text>
        <Text style={{ fontSize: FS.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{filtered.length} sur {clients.length} clients</Text>
      </View>
      <View style={{ padding: SP.lg, paddingBottom: SP.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: Colors.gray200 }}>
          <Icon name="search" size={16} color={Colors.gray400} />
          <TextInput style={{ flex: 1, marginLeft: 8 }} value={search} onChangeText={setSearch} placeholder="Nom ou numéro de téléphone" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: SP.lg, paddingBottom: SP.sm }}>
        {[['all', 'Tous'], ['active', 'Actifs'], ['blocked', 'Bloqués']].map(([id, label]) => (
          <Chip key={id} label={label} selected={filter === id} onPress={() => setFilter(id)} />
        ))}
      </View>
      <FlatList data={filtered} keyExtractor={c => c.id} contentContainerStyle={{ padding: SP.lg, gap: 8, paddingTop: 0 }}
        ListEmptyComponent={<EmptyState icon="users" title="Aucun client" subtitle="Modifiez votre recherche" />}
        renderItem={({ item, index }) => {
          const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const initials = item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const isBlocked = item.status === 'blocked';
          return (
            <TouchableOpacity onPress={() => openDetail(item)} style={{ backgroundColor: Colors.white, borderRadius: 12, padding: SP.md, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.gray100 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: Colors.white, fontWeight: FW.black }}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: Colors.gray900 }}>{item.name}</Text>
                <Text style={{ fontSize: FS.xs, color: Colors.gray400 }}>{item.phone} · {item.txCount} opérations</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: FS.sm, fontWeight: FW.black, color: Colors.blue600 }}>{item.balance.toLocaleString('fr-FR')} F</Text>
                <Badge label={isBlocked ? 'Bloqué' : 'Actif'} variant={isBlocked ? 'danger' : 'success'} />
              </View>
            </TouchableOpacity>
          );
        }} />

      <BottomSheet visible={showDetail} onClose={() => setShowDetail(false)} title="Profil client">
        {selected && (() => {
          const idx = clients.findIndex(c => c.id === selected.id);
          const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const init = selected.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const isBlocked = selected.status === 'blocked';
          return (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: Colors.white, fontWeight: FW.black, fontSize: 18 }}>{init}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.gray900 }}>{selected.name}</Text>
                  <Text style={{ fontSize: FS.xs, color: Colors.gray400, marginTop: 2 }}>{selected.phone}</Text>
                  <View style={{ marginTop: 6 }}><Badge label={isBlocked ? 'Bloqué' : 'Actif'} variant={isBlocked ? 'danger' : 'success'} /></View>
                </View>
              </View>
              <Card style={{ marginBottom: SP.lg }}>
                <View style={{ padding: SP.md }}>
                  <InfoRow label="Solde" value={selected.balance.toLocaleString('fr-FR') + ' FCFA'} valueColor={Colors.blue600} />
                  <InfoRow label="Total déposé" value={'+' + selected.totalDeposited.toLocaleString('fr-FR') + ' FCFA'} valueColor={Colors.green500} />
                  <InfoRow label="Total retiré" value={'-' + selected.totalWithdrawn.toLocaleString('fr-FR') + ' FCFA'} valueColor={Colors.orange500} last />
                </View>
              </Card>
              <Button title="Voir l'historique complet" onPress={() => openHistory(selected)} variant="secondary" icon="list" style={{ marginBottom: 10 }} />
              <Button title={isBlocked ? 'Débloquer ce client' : 'Bloquer ce client'} onPress={() => openBlock(selected)} variant={isBlocked ? 'success' : 'danger'} icon={isBlocked ? 'unlock' : 'ban'} style={{ marginBottom: 10 }} />
              <Button title="Fermer" onPress={() => setShowDetail(false)} variant="ghost" />
            </>
          );
        })()}
      </BottomSheet>

      <BottomSheet visible={showHistory} onClose={() => setShowHistory(false)} title={`Historique de ${selected?.name || ''}`}>
        {history.length === 0
          ? <EmptyState icon="list" title="Aucune opération" />
          : history.map((tx) => <View key={tx.id} style={{ marginBottom: 8 }}><Card><TxRow tx={tx} last /></Card></View>)
        }
      </BottomSheet>

      <BottomSheet visible={showBlock} onClose={() => setShowBlock(false)} title="Confirmer">
        {selected && <>
          <ConfirmBox message={`Code PIN requis pour ${selected.status === 'blocked' ? 'débloquer' : 'bloquer'} ${selected.name}.`} variant="danger" />
          <OTPInput length={4} value={pin} onChange={setPin} secure />
          <Button title="Confirmer" onPress={doToggleBlock} loading={loading} variant="danger" icon="shield" style={{ marginBottom: 10 }} />
          <Button title="Annuler" onPress={() => setShowBlock(false)} variant="ghost" />
        </>}
      </BottomSheet>
    </View>
  );
}
