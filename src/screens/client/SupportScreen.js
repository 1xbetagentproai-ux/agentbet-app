// src/screens/client/SupportScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Linking, Alert } from 'react-native';
import { useAuth } from '../../navigation/AuthContext';
import { ClientAPI } from '../../config/backendReal';
import { Card } from '../../components/UI';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

const SUPPORT_PHONE_DISPLAY = '+228 99 00 00 00';
const SUPPORT_PHONE_DIAL = '+22899000000';
const SUPPORT_WHATSAPP = '22899000000';

export default function SupportScreen({ go }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('contact');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (tab === 'chat' && user) {
      unsubscribeRef.current = ClientAPI.listenToMessages(user.id, (msgs) => {
        setMessages(msgs);
        setTimeout(() => listRef.current?.scrollToEnd(), 100);
      });
    }
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, [tab, user?.id]);

  const openWhatsApp = () => {
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'assistance.')}`;
    Linking.openURL(url).catch(() => Alert.alert('Erreur', 'WhatsApp n\'est pas installé.'));
  };
  const openPhoneCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE_DIAL}`).catch(() => Alert.alert('Erreur', 'Impossible de lancer l\'appel.'));
  };

  const send = async () => {
    if (!text.trim()) return;
    await ClientAPI.sendMessage(user.id, text.trim());
    setText('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={{ backgroundColor: Colors.blue600, paddingTop: 54, paddingBottom: 16, paddingHorizontal: SP.lg }}>
        <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Support client</Text>
        <Text style={{ fontSize: FS.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Nous sommes là pour vous aider</Text>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: Colors.gray50, borderRadius: 10, padding: 4, margin: SP.lg }}>
        <TouchableOpacity onPress={() => setTab('contact')} style={{ flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: tab === 'contact' ? Colors.white : 'transparent' }}>
          <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: tab === 'contact' ? Colors.blue600 : Colors.gray500 }}>Nous contacter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('chat')} style={{ flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: tab === 'chat' ? Colors.white : 'transparent' }}>
          <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: tab === 'chat' ? Colors.blue600 : Colors.gray500 }}>Chat intégré</Text>
        </TouchableOpacity>
      </View>

      {tab === 'contact' ? (
        <View style={{ paddingHorizontal: SP.lg }}>
          <Card>
            <TouchableOpacity onPress={openWhatsApp} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.gray100 }}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="whatsapp" size={22} color={Colors.whatsapp} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: Colors.gray900 }}>WhatsApp</Text>
                <Text style={{ fontSize: FS.xs, color: Colors.gray400, marginTop: 2 }}>Réponse rapide, 8h à 22h</Text>
              </View>
              <Icon name="chevronRight" size={16} color={Colors.gray300} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openPhoneCall} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15 }}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.blue50, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="phone" size={20} color={Colors.blue500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: Colors.gray900 }}>Appel téléphonique</Text>
                <Text style={{ fontSize: FS.xs, color: Colors.gray400, marginTop: 2 }}>{SUPPORT_PHONE_DISPLAY}</Text>
              </View>
              <Icon name="chevronRight" size={16} color={Colors.gray300} />
            </TouchableOpacity>
          </Card>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList ref={listRef} data={messages} keyExtractor={m => m.id} contentContainerStyle={{ padding: 14 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd()}
            renderItem={({ item }) => {
              const isMe = item.sender === 'client';
              return (
                <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, marginBottom: 14, alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                  <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: isMe ? Colors.gray200 : Colors.blue600, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={isMe ? 'user' : 'shield'} size={13} color={isMe ? Colors.gray600 : Colors.white} />
                  </View>
                  <View style={{ backgroundColor: isMe ? Colors.blue500 : Colors.gray100, borderRadius: 16, padding: 10 }}>
                    <Text style={{ fontSize: FS.sm, color: isMe ? Colors.white : Colors.gray800 }}>{item.text}</Text>
                  </View>
                </View>
              );
            }} />
          <View style={{ flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: Colors.gray200 }}>
            <TextInput style={{ flex: 1, backgroundColor: Colors.gray100, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 }} value={text} onChangeText={setText} placeholder="Écrire un message" onSubmitEditing={send} />
            <TouchableOpacity onPress={send} style={{ width: 42, height: 42, backgroundColor: Colors.blue500, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="send" size={17} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
