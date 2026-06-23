// src/screens/client/NotifScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { ClientAPI } from '../../config/backendReal';
import { EmptyState } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

const NOTIF_CONFIG = {
  deposit_approved: { icon: 'deposit', color: Colors.green500, bg: Colors.green100 },
  deposit_pending: { icon: 'clock', color: Colors.amber500, bg: Colors.amber100 },
  withdraw_done: { icon: 'withdraw', color: Colors.green500, bg: Colors.green100 },
  withdraw_pending: { icon: 'clock', color: Colors.amber500, bg: Colors.amber100 },
  promo: { icon: 'gift', color: Colors.blue600, bg: Colors.blue100 },
  rejected: { icon: 'xCircle', color: Colors.red500, bg: Colors.red100 },
};

export default function NotifScreen({ go }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);

  const load = useCallback(async () => {
    const r = await ClientAPI.getNotifications(user.id);
    if (r.success) setNotifs(r.notifications);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <View style={{ backgroundColor: Colors.blue600, paddingTop: 54, paddingBottom: 16, paddingHorizontal: SP.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Notifications</Text>
        <TouchableOpacity onPress={async () => { await ClientAPI.markAllRead(user.id); load(); }}>
          <Text style={{ color: Colors.blue300, fontWeight: FW.semiBold, fontSize: FS.sm }}>Tout marquer comme lu</Text>
        </TouchableOpacity>
      </View>
      {notifs.length === 0 ? <EmptyState icon="bell" title="Aucune notification" subtitle="Vous êtes à jour" /> : (
        <FlatList data={notifs} keyExtractor={i => i.id} contentContainerStyle={{ padding: SP.lg, gap: 8 }}
          renderItem={({ item }) => {
            const conf = NOTIF_CONFIG[item.type] || NOTIF_CONFIG.promo;
            const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();
            return (
              <View style={{ backgroundColor: item.read ? Colors.white : Colors.blue50, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: item.read ? Colors.gray100 : Colors.blue100 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: conf.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={conf.icon} size={18} color={conf.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.gray900 }}>{item.title}</Text>
                  <Text style={{ fontSize: FS.xs, color: Colors.gray500, marginTop: 4, lineHeight: 17 }}>{item.body}</Text>
                  <Text style={{ fontSize: 10, color: Colors.gray400, marginTop: 6 }}>
                    {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }} />
      )}
    </View>
  );
}
