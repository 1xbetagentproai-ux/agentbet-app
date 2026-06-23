// src/screens/admin/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { AdminAPI } from '../../config/backendReal';
import { Card, StatCard, Badge, BottomSheet, OTPInput, ConfirmBox, Button, EmptyState, Switch } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

export const REJECT_REASONS = ['Preuve de paiement invalide', 'Montant incorrect', 'ID 1xBet inexistant', 'Informations incomplètes', 'Activité suspecte'];
export const AVATAR_COLORS = [Colors.blue500, Colors.green500, Colors.orange500, '#7C3AED', Colors.red500, '#0891B2'];

export function ApproveSheet({ visible, onClose, tx, onDone }) {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (visible) setPin(''); }, [visible]);

  const doApprove = async () => {
    if (pin.length < 4) { Alert.alert('Code PIN requis'); return; }
    setLoading(true);
    const r = await AdminAPI.approveTransaction(tx.id, pin, user.id);
    setLoading(false);
    if (!r.success) { Alert.alert('Erreur', r.error); return; }
    onClose(); Alert.alert('Validé', 'Transaction confirmée avec succès.'); onDone();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Confirmation de paiement">
      {tx && <>
        <ConfirmBox message={`Valider le ${tx.type === 'deposit' ? 'dépôt' : 'retrait'} de ${tx.amount.toLocaleString('fr-FR')} FCFA pour ${tx.userName} ?`} variant="info" />
        <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 4, textTransform: 'uppercase' }}>Code PIN de validation</Text>
        <OTPInput length={4} value={pin} onChange={setPin} secure />
        <Button title="Confirmer le paiement" onPress={doApprove} loading={loading} variant="success" icon="checkCircle" style={{ marginBottom: 10 }} />
        <Button title="Annuler" onPress={onClose} variant="ghost" />
      </>}
    </BottomSheet>
  );
}

export function RejectSheet({ visible, onClose, tx, onDone }) {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (visible) { setPin(''); setReason(REJECT_REASONS[0]); } }, [visible]);

  const doReject = async () => {
    if (pin.length < 4) { Alert.alert('Code PIN requis'); return; }
    setLoading(true);
    const r = await AdminAPI.rejectTransaction(tx.id, reason, pin, user.id);
    setLoading(false);
    if (!r.success) { Alert.alert('Erreur', r.error); return; }
    onClose(); Alert.alert('Rejeté', 'Demande rejetée avec motif transmis au client.'); onDone();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Rejet avec motif">
      {tx && <>
        <ConfirmBox message={`Rejeter la demande de ${tx.userName} (${tx.amount.toLocaleString('fr-FR')} FCFA) ?`} variant="danger" />
        <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 8, textTransform: 'uppercase' }}>Motif du rejet</Text>
        {REJECT_REASONS.map(r => (
          <TouchableOpacity key={r} onPress={() => setReason(r)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray100 }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: reason === r ? Colors.blue500 : Colors.gray300, backgroundColor: reason === r ? Colors.blue500 : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {reason === r && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.white }} />}
            </View>
            <Text style={{ fontSize: FS.sm, color: Colors.gray800 }}>{r}</Text>
          </TouchableOpacity>
        ))}
        <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>Code PIN de validation</Text>
        <OTPInput length={4} value={pin} onChange={setPin} secure />
        <Button title="Confirmer le rejet" onPress={doReject} loading={loading} variant="danger" icon="xCircle" style={{ marginTop: 8, marginBottom: 10 }} />
        <Button title="Annuler" onPress={onClose} variant="ghost" />
      </>}
    </BottomSheet>
  );
}

export default function AdminDashboard({ go }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [autoValidation, setAutoValidation] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const s = await AdminAPI.getStats(); if (s.success) setStats(s.stats);
    const t = await AdminAPI.getTransactions('pending'); if (t.success) setPending(t.transactions);
    const v = await AdminAPI.getValidationMode(); if (v.success) setAutoValidation(v.autoValidation);
  }, []);
  useEffect(() => { load(); }, [load]);

  const fmtK = n => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n);

  const toggleValidationMode = async (val) => {
    await AdminAPI.setValidationMode(val);
    setAutoValidation(val);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <View style={{ backgroundColor: Colors.blue900, paddingTop: 54, paddingBottom: SP.lg, paddingHorizontal: SP.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: FW.bold, textTransform: 'uppercase' }}>Agent</Text>
          <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>{user?.name}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="shield" size={13} color={Colors.white} />
          <Text style={{ color: Colors.white, fontSize: FS.xs, fontWeight: FW.bold }}>ADMIN</Text>
        </View>
      </View>
      <ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: SP.lg }}>
          {stats && <>
            <StatCard icon="deposit" value={fmtK(stats.totalDeposits) + ' F'} label="Total des dépôts" color={Colors.green500} trend="+12% ce mois" trendUp />
            <StatCard icon="withdraw" value={fmtK(stats.totalWithdrawals) + ' F'} label="Total des retraits" color={Colors.orange500} trend="-3% ce mois" trendUp={false} />
            <StatCard icon="trendUp" value={fmtK(stats.profit) + ' F'} label="Bénéfices" color={Colors.blue500} trend="+28% ce mois" trendUp />
            <StatCard icon="users" value={String(stats.activeClients)} label="Nombre de clients actifs" color={Colors.gray900} />
          </>}
        </View>

        <View style={{ marginHorizontal: SP.lg, marginBottom: SP.lg }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: SP.lg }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.blue50, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="zap" size={18} color={Colors.blue500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: Colors.gray900 }}>Validation automatique des dépôts</Text>
                <Text style={{ fontSize: FS.xs, color: Colors.gray400, marginTop: 2 }}>{autoValidation ? 'Activée — crédit immédiat' : 'Désactivée — validation manuelle'}</Text>
              </View>
              <Switch value={autoValidation} onChange={toggleValidationMode} />
            </View>
          </Card>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SP.lg, marginBottom: 10 }}>
          <Text style={{ fontSize: FS.base, fontWeight: FW.black, color: Colors.gray900 }}>Demandes en attente</Text>
          <Badge label={String(pending.length)} variant="pending" />
        </View>
        <Card style={{ marginHorizontal: SP.lg, marginBottom: 24 }}>
          {pending.length === 0 ? <EmptyState icon="checkCircle" title="Aucune demande" subtitle="Tout est traité" /> : pending.map((tx, i) => (
            <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: i < pending.length - 1 ? 1 : 0, borderBottomColor: Colors.gray100 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.blue50, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: FW.black, color: Colors.blue600, fontSize: FS.sm }}>{(tx.userName || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.gray900 }}>{tx.userName}</Text>
                <Text style={{ fontSize: FS.xs, color: Colors.gray400 }}>{tx.type === 'deposit' ? 'Dépôt' : 'Retrait'} · {tx.amount.toLocaleString('fr-FR')} FCFA · {tx.network}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={() => { setSelected(tx); setShowApprove(true); }} style={{ width: 34, height: 34, backgroundColor: Colors.green100, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={15} color={Colors.green500} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSelected(tx); setShowReject(true); }} style={{ width: 34, height: 34, backgroundColor: Colors.red100, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x" size={15} color={Colors.red500} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>

      <ApproveSheet visible={showApprove} onClose={() => setShowApprove(false)} tx={selected} onDone={load} />
      <RejectSheet visible={showReject} onClose={() => setShowReject(false)} tx={selected} onDone={load} />
    </View>
  );
}
