// src/screens/client/HistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { ClientAPI } from '../../config/backendReal';
import { EmptyState, Chip, Card } from '../../components/UI';
import { TxRow } from './DashboardScreen';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

export default function HistoryScreen({ go }) {
  const { user } = useAuth();
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const r = await ClientAPI.getTransactions(user.id);
    if (r.success) setTxs(r.transactions);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter(t => filter === 'all' || (filter === 'pending' ? t.status === 'pending' : t.type === filter));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <View style={{ backgroundColor: Colors.blue600, paddingTop: 54, paddingBottom: 16, paddingHorizontal: SP.lg }}>
        <TouchableOpacity onPress={() => go('dash')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="chevronLeft" size={18} color="rgba(255,255,255,0.85)" />
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: FS.sm }}>Retour</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white, marginTop: 8 }}>Historique des opérations</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, padding: SP.lg }}>
        {[['all', 'Tout'], ['deposit', 'Dépôts'], ['withdraw', 'Retraits'], ['pending', 'En attente']].map(([id, label]) => (
          <Chip key={id} label={label} selected={filter === id} onPress={() => setFilter(id)} />
        ))}
      </View>
      {filtered.length === 0 ? <EmptyState icon="list" title="Aucune opération" /> : (
        <FlatList data={filtered} keyExtractor={t => t.id} contentContainerStyle={{ padding: SP.lg, gap: 8 }}
          renderItem={({ item }) => <Card><TxRow tx={item} last /></Card>} />
      )}
    </View>
  );
}
