// src/screens/client/DashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { ClientAPI } from '../../config/backendReal';
import { Card, EmptyState, StatCard, Badge } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP, RAD } from '../../config/theme';

export function TxRow({ tx, last }) {
  const isDep = tx.type === 'deposit';
  const statusMap = {
    approved: { label: isDep ? 'Validé' : 'Effectué', color: Colors.green500, icon: 'checkCircle' },
    pending: { label: 'En attente', color: Colors.amber500, icon: 'clock' },
    rejected: { label: 'Rejeté', color: Colors.red500, icon: 'xCircle' },
  };
  const st = statusMap[tx.status] || statusMap.pending;
  const date = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date();
  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: SP.lg, borderBottomWidth: last ? 0 : 1, borderBottomColor: Colors.gray100 }}>
      <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: isDep ? Colors.blue50 : Colors.orange50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={isDep ? 'deposit' : 'withdraw'} size={19} color={isDep ? Colors.blue500 : Colors.orange500} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FS.base, fontWeight: FW.semiBold, color: Colors.gray900 }}>{isDep ? 'Dépôt 1xBet' : 'Retrait 1xBet'}</Text>
        <Text style={{ fontSize: FS.xs, color: Colors.gray400, marginTop: 2 }}>ID {tx.betId} · {tx.network} · {dateStr}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: isDep ? Colors.green500 : Colors.orange500 }}>{isDep ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <Icon name={st.icon} size={11} color={st.color} />
          <Text style={{ fontSize: FS.xs, color: st.color, fontWeight: FW.semiBold }}>{st.label}</Text>
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen({ go }) {
  const { user, refreshUser } = useAuth();
  const [txs, setTxs] = useState([]);
  const [pendingTxs, setPendingTxs] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [promos, setPromos] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    await refreshUser();
    const r = await ClientAPI.getTransactions(user.id);
    if (r.success) {
      setTxs(r.transactions.slice(0, 4));
      setPendingTxs(r.transactions.filter(t => t.status === 'pending'));
    }
    const n = await ClientAPI.getNotifications(user.id);
    if (n.success) setNotifCount(n.unread);
    const p = await ClientAPI.getPromos();
    if (p.success) setPromos(p.promos);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const balance = user?.balance || 0;
  const firstName = user?.name?.split(' ')[0] || 'Client';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <View style={{ backgroundColor: Colors.blue600, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SP.lg, paddingTop: 54, paddingBottom: SP.lg }}>
        <View>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.7)' }}>Bonjour</Text>
          <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>{firstName}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={{ width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => go('notifs')}>
            <Icon name="bell" size={18} color={Colors.white} />
            {notifCount > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: Colors.red500, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.blue600 }}>
                <Text style={{ fontSize: 9, fontWeight: FW.black, color: Colors.white }}>{notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => go('profile')}>
            <Icon name="user" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: Colors.blue600, marginHorizontal: SP.lg, borderRadius: RAD.lg, padding: SP.xl, marginTop: SP.lg, marginBottom: SP.lg }}>
          <Text style={{ fontSize: FS.sm, color: 'rgba(255,255,255,0.65)' }}>Solde du compte</Text>
          <Text style={{ fontSize: 36, fontWeight: FW.black, color: Colors.white, marginTop: 4 }}>{balance.toLocaleString('fr-FR')}</Text>
          <Text style={{ fontSize: FS.base, color: 'rgba(255,255,255,0.7)' }}>FCFA</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: SP.lg }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.white, borderRadius: RAD.sm, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }} onPress={() => go('deposit')}>
              <Icon name="deposit" size={16} color={Colors.blue600} />
              <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.blue600 }}>Dépôt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RAD.sm, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }} onPress={() => go('withdraw')}>
              <Icon name="withdraw" size={16} color={Colors.white} />
              <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.white }}>Retrait</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pendingTxs.length > 0 && (
          <View style={{ paddingHorizontal: SP.lg, marginBottom: SP.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="clock" size={16} color={Colors.amber500} />
              <Text style={{ fontSize: FS.base, fontWeight: FW.black, color: Colors.gray900 }}>Demandes en cours</Text>
              <Badge label={String(pendingTxs.length)} variant="pending" />
            </View>
            <Card>
              {pendingTxs.slice(0, 3).map((tx, i) => <TxRow key={tx.id} tx={tx} last={i === Math.min(pendingTxs.length, 3) - 1} />)}
            </Card>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: SP.lg, marginBottom: SP.lg }}>
          <StatCard icon="deposit" value={txs.filter(t => t.type === 'deposit').length} label="Dépôts" color={Colors.blue500} />
          <StatCard icon="withdraw" value={txs.filter(t => t.type === 'withdraw').length} label="Retraits" color={Colors.orange500} />
          <StatCard icon="clock" value={pendingTxs.length} label="En attente" color={Colors.amber500} />
        </View>

        {promos.length > 0 && (
          <View style={{ backgroundColor: Colors.blue700, marginHorizontal: SP.lg, borderRadius: RAD.md, padding: SP.lg, marginBottom: SP.lg, flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="gift" size={18} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: Colors.white }}>{promos[0].title}</Text>
              <Text style={{ fontSize: FS.xs, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{promos[0].body}</Text>
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SP.lg, marginBottom: 10 }}>
          <Text style={{ fontSize: FS.base, fontWeight: FW.black, color: Colors.gray900 }}>Historique des opérations</Text>
          <TouchableOpacity onPress={() => go('history')}>
            <Text style={{ fontSize: FS.sm, color: Colors.blue500, fontWeight: FW.semiBold }}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <Card style={{ marginHorizontal: SP.lg, marginBottom: 24 }}>
          {txs.length === 0
            ? <EmptyState icon="wallet" title="Aucune opération" subtitle="Effectuez votre premier dépôt" />
            : txs.map((tx, i) => <TxRow key={tx.id} tx={tx} last={i === txs.length - 1} />)
          }
        </Card>
      </ScrollView>
    </View>
  );
}
