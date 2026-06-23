// src/screens/admin/TransactionsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { AdminAPI } from '../../config/backendReal';
import { Card, Chip, EmptyState, Badge, BottomSheet, Button, InfoRow } from '../../components/UI';
import { ApproveSheet, RejectSheet } from './AdminDashboard';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

export default function TransactionsScreen({ go }) {
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => { const r = await AdminAPI.getTransactions(filter); if (r.success) setTxs(r.transactions); }, [filter]);
  useEffect(() => { load(); }, [load]);

  const statusMap = { approved: { label: 'Validé', variant: 'success', icon: 'checkCircle' }, pending: { label: 'En attente', variant: 'pending', icon: 'clock' }, rejected: { label: 'Rejeté', variant: 'danger', icon: 'xCircle' } };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <View style={{ backgroundColor: Colors.blue900, paddingTop: 54, paddingBottom: SP.lg, paddingHorizontal: SP.lg }}>
        <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Gestion des transactions</Text>
        <Text style={{ fontSize: FS.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Dépôts et retraits</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: SP.lg }}>
        {[['all', 'Toutes'], ['pending', 'En attente'], ['deposit', 'Dépôts'], ['withdraw', 'Retraits'], ['approved', 'Validées'], ['rejected', 'Rejetées']].map(([id, label]) => (
          <Chip key={id} label={label} selected={filter === id} onPress={() => setFilter(id)} />
        ))}
      </View>
      <FlatList data={txs} keyExtractor={t => t.id} contentContainerStyle={{ padding: SP.lg, gap: 8, paddingTop: 0 }}
        ListEmptyComponent={<EmptyState icon="list" title="Aucune transaction" subtitle="Aucun résultat pour ce filtre" />}
        renderItem={({ item }) => {
          const isDep = item.type === 'deposit'; const st = statusMap[item.status];
          return (
            <TouchableOpacity onPress={() => { setSelected(item); setShowDetail(true); }} style={{ backgroundColor: Colors.white, borderRadius: 12, padding: SP.md, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.gray100 }}>
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: isDep ? Colors.blue50 : Colors.orange50, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={isDep ? 'deposit' : 'withdraw'} size={19} color={isDep ? Colors.blue500 : Colors.orange500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.gray900 }}>{item.userName}</Text>
                <Text style={{ fontSize: FS.xs, color: Colors.gray400 }}>{item.network} · ID {item.betId}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: isDep ? Colors.green500 : Colors.orange500 }}>{isDep ? '+' : '-'}{item.amount.toLocaleString('fr-FR')}</Text>
                {item.status === 'pending'
                  ? <View style={{ flexDirection: 'row', gap: 5 }}>
                      <TouchableOpacity onPress={() => { setSelected(item); setShowApprove(true); }} style={{ width: 30, height: 30, backgroundColor: Colors.green100, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={14} color={Colors.green500} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setSelected(item); setShowReject(true); }} style={{ width: 30, height: 30, backgroundColor: Colors.red100, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="x" size={14} color={Colors.red500} />
                      </TouchableOpacity>
                    </View>
                  : <Badge label={st.label} variant={st.variant} />
                }
              </View>
            </TouchableOpacity>
          );
        }} />

      <ApproveSheet visible={showApprove} onClose={() => setShowApprove(false)} tx={selected} onDone={load} />
      <RejectSheet visible={showReject} onClose={() => setShowReject(false)} tx={selected} onDone={load} />

      <BottomSheet visible={showDetail} onClose={() => setShowDetail(false)} title="Détail de la transaction">
        {selected && <>
          <Card style={{ marginBottom: SP.lg }}>
            <View style={{ padding: SP.md }}>
              <InfoRow label="Type" value={selected.type === 'deposit' ? 'Dépôt' : 'Retrait'} />
              <InfoRow label="Client" value={selected.userName || '—'} />
              <InfoRow label="ID 1xBet" value={selected.betId} />
              <InfoRow label="Réseau" value={selected.network} />
              {selected.mmPhone && <InfoRow label="Numéro Mobile Money" value={selected.mmPhone} />}
              <InfoRow label="Montant" value={selected.amount.toLocaleString('fr-FR') + ' FCFA'} valueColor={Colors.blue600} />
              <InfoRow label="Statut" value={statusMap[selected.status]?.label} last />
            </View>
          </Card>
          {selected.agentNote && (
            <View style={{ backgroundColor: Colors.red100, borderRadius: 10, padding: 12, marginBottom: SP.md }}>
              <Text style={{ fontSize: FS.sm, color: '#991B1B' }}><Text style={{ fontWeight: FW.bold }}>Motif du rejet :</Text> {selected.agentNote}</Text>
            </View>
          )}
          {selected.status === 'pending' && (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Button title="Valider" onPress={() => { setShowDetail(false); setTimeout(() => setShowApprove(true), 250); }} variant="success" icon="check" style={{ flex: 1 }} />
              <Button title="Rejeter" onPress={() => { setShowDetail(false); setTimeout(() => setShowReject(true), 250); }} variant="danger" icon="x" style={{ flex: 1 }} />
            </View>
          )}
          <Button title="Fermer" onPress={() => setShowDetail(false)} variant="ghost" />
        </>}
      </BottomSheet>
    </View>
  );
}
