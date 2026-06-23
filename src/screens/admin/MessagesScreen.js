// src/screens/admin/MessagesScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { AdminAPI, ClientAPI } from '../../config/backendReal';
import { EmptyState } from '../../components/UI';
import { AVATAR_COLORS } from './AdminDashboard';
import Icon from '../../components/Icon';
import { Colors, FS, FW, SP } from '../../config/theme';

export default function MessagesScreen({ go }) {
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const loadConvs = useCallback(async () => {
    const r = await AdminAPI.getAllConversations();
    if (r.success) setConvs(r.conversations);
  }, []);

  useEffect(() => { if (!active) loadConvs(); }, [active, loadConvs]);

  const openChat = (conv) => {
    setActive(conv.userId);
    setMessages(conv.messages);
    unsubscribeRef.current = ClientAPI.listenToMessages(conv.userId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
    });
  };

  const closeChat = () => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    setActive(null);
    loadConvs();
  };

  const sendReply = async () => {
    if (!text.trim() || !active) return;
    await AdminAPI.replyMessage(active, text.trim());
    setText('');
  };

  if (!active) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.gray50 }}>
        <View style={{ backgroundColor: Colors.blue900, paddingTop: 54, paddingBottom: SP.lg, paddingHorizontal: SP.lg }}>
          <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.white }}>Messages clients</Text>
        </View>
        {convs.length === 0 ? <EmptyState icon="chat" title="Aucun message" /> : (
          <FlatList data={convs} keyExtractor={c => c.userId} contentContainerStyle={{ padding: SP.lg, gap: 8 }}
            renderItem={({ item, index }) => {
              const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const isUnread = item.lastMessage?.sender === 'client';
              return (
                <TouchableOpacity onPress={() => openChat(item)} style={{ backgroundColor: isUnread ? Colors.blue50 : Colors.white, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.gray100 }}>
                  <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: Colors.white, fontWeight: FW.black }}>{item.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: FS.base, fontWeight: FW.bold, color: Colors.gray900 }}>{item.userName}</Text>
                    <Text style={{ fontSize: FS.xs, color: Colors.gray400 }} numberOfLines={1}>{item.lastMessage?.text}</Text>
                  </View>
                  {isUnread && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.blue500 }} />}
                </TouchableOpacity>
              );
            }} />
        )}
      </View>
    );
  }

  const conv = convs.find(c => c.userId === active);
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ backgroundColor: Colors.blue900, paddingTop: 54, paddingBottom: 12, paddingHorizontal: SP.lg, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={closeChat} style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevronLeft" size={18} color={Colors.white} />
        </TouchableOpacity>
        <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: Colors.white }}>{conv?.userName}</Text>
      </View>
      <FlatList ref={listRef} data={messages} keyExtractor={m => m.id} contentContainerStyle={{ padding: SP.md }} onContentSizeChange={() => listRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const isMe = item.sender === 'agent';
          return (
            <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, marginBottom: 14, alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: isMe ? Colors.blue600 : Colors.gray200, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={isMe ? 'shield' : 'user'} size={13} color={isMe ? Colors.white : Colors.gray600} />
              </View>
              <View style={{ backgroundColor: isMe ? Colors.blue500 : Colors.gray100, borderRadius: 16, padding: 10 }}>
                <Text style={{ color: isMe ? Colors.white : Colors.gray800, fontSize: FS.sm }}>{item.text}</Text>
              </View>
            </View>
          );
        }} />
      <View style={{ flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: Colors.gray200 }}>
        <TextInput style={{ flex: 1, backgroundColor: Colors.gray100, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 }} value={text} onChangeText={setText} placeholder="Répondre au client" onSubmitEditing={sendReply} />
        <TouchableOpacity onPress={sendReply} style={{ width: 42, height: 42, backgroundColor: Colors.blue600, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="send" size={17} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
