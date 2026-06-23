// src/components/UI.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  Modal, Pressable, ScrollView,
} from 'react-native';
import Icon from './Icon';
import { Colors, FS, FW, SP, RAD } from '../config/theme';

export function Button({ title, onPress, variant = 'primary', loading, disabled, style, icon }) {
  const variants = {
    primary: { bg: Colors.blue500, text: Colors.white },
    secondary: { bg: Colors.blue50, text: Colors.blue600 },
    danger: { bg: Colors.red500, text: Colors.white },
    success: { bg: Colors.green500, text: Colors.white },
    ghost: { bg: Colors.gray100, text: Colors.gray700 },
  };
  const v = variants[variant] || variants.primary;
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.82}
      style={[{ backgroundColor: v.bg, borderRadius: RAD.md, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: disabled ? 0.5 : 1 }, style]}>
      {loading ? <ActivityIndicator color={v.text} /> : <>
        {icon && <Icon name={icon} size={18} color={v.text} />}
        <Text style={{ color: v.text, fontSize: FS.md, fontWeight: FW.bold }}>{title}</Text>
      </>}
    </TouchableOpacity>
  );
}

export function Input({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, error, icon, autoCapitalize = 'none' }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: SP.md }}>
      {label && <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: Colors.gray600, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: focused ? Colors.white : Colors.gray50, borderWidth: 1.5, borderColor: error ? Colors.red500 : focused ? Colors.blue500 : Colors.gray200, borderRadius: RAD.sm, paddingHorizontal: SP.md }}>
        {icon && <View style={{ marginRight: 10 }}><Icon name={icon} size={18} color={focused ? Colors.blue500 : Colors.gray400} /></View>}
        <TextInput
          style={{ flex: 1, paddingVertical: 13, fontSize: FS.md, color: Colors.gray900 }}
          placeholder={placeholder} placeholderTextColor={Colors.gray400}
          value={value} onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType || 'default'}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(!show)} style={{ padding: 4 }}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={18} color={Colors.gray400} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={{ fontSize: FS.xs, color: Colors.red500, marginTop: 5 }}>{error}</Text>}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[{ backgroundColor: Colors.white, borderRadius: RAD.md, borderWidth: 1, borderColor: Colors.gray100 }, style]}>{children}</View>;
}

export function Badge({ label, variant = 'info' }) {
  const variants = {
    success: { bg: Colors.green100, text: '#065F46' }, pending: { bg: Colors.amber100, text: '#92400E' },
    danger: { bg: Colors.red100, text: '#991B1B' }, info: { bg: Colors.blue100, text: Colors.blue700 },
  };
  const v = variants[variant] || variants.info;
  return (
    <View style={{ backgroundColor: v.bg, borderRadius: RAD.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: FS.xs, fontWeight: FW.bold, color: v.text }}>{label}</Text>
    </View>
  );
}

export function ConfirmBox({ message, variant = 'info' }) {
  const colors = { info: { bg: Colors.blue50, text: Colors.blue700, icon: 'info' }, danger: { bg: Colors.red100, text: '#991B1B', icon: 'alert' }, warning: { bg: Colors.amber100, text: '#92400E', icon: 'alert' } };
  const c = colors[variant] || colors.info;
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: RAD.sm, padding: 14, marginBottom: 16, flexDirection: 'row', gap: 10 }}>
      <Icon name={c.icon} size={18} color={c.text} />
      <Text style={{ fontSize: FS.sm, color: c.text, lineHeight: 20, flex: 1 }}>{message}</Text>
    </View>
  );
}

export function OTPInput({ length = 6, value, onChange, secure }) {
  const inputs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');
  const handleChange = (text, idx) => {
    if (text.length > 1) text = text.slice(-1);
    const arr = [...value.padEnd(length, '').split('')];
    arr[idx] = text;
    const newVal = arr.join('').slice(0, length);
    onChange(newVal);
    if (text && idx < length - 1) inputs.current[idx + 1]?.focus();
  };
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 16 }}>
      {digits.map((d, i) => (
        <TextInput key={i} ref={r => inputs.current[i] = r}
          style={{ width: 44, height: 54, borderRadius: 12, backgroundColor: Colors.gray50, borderWidth: 2, borderColor: d ? Colors.blue500 : Colors.gray200, fontSize: 20, fontWeight: FW.black, color: Colors.blue600, textAlign: 'center' }}
          value={d} onChangeText={t => handleChange(t, i)} keyboardType="number-pad" maxLength={1} secureTextEntry={secure}
        />
      ))}
    </View>
  );
}

export function BottomSheet({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30, maxHeight: '88%' }} onPress={e => e.stopPropagation()}>
          <View style={{ width: 40, height: 4, backgroundColor: Colors.gray200, borderRadius: 2, alignSelf: 'center', marginTop: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ fontSize: FS.lg, fontWeight: FW.black, color: Colors.gray900 }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 30, height: 30, backgroundColor: Colors.gray100, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={15} color={Colors.gray500} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ paddingHorizontal: 20 }}>{children}<View style={{ height: 20 }} /></ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon name={icon} size={28} color={Colors.gray400} />
      </View>
      <Text style={{ fontSize: FS.lg, fontWeight: FW.bold, color: Colors.gray700 }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: FS.sm, color: Colors.gray400, marginTop: 6, textAlign: 'center' }}>{subtitle}</Text>}
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: selected ? Colors.blue50 : Colors.gray100, borderWidth: 1.5, borderColor: selected ? Colors.blue500 : Colors.gray200, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
      <Text style={{ fontSize: FS.sm, fontWeight: FW.bold, color: selected ? Colors.blue600 : Colors.gray600 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function InfoRow({ label, value, valueColor, last }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: last ? 0 : 1, borderBottomColor: Colors.gray100 }}>
      <Text style={{ fontSize: FS.sm, color: Colors.gray500 }}>{label}</Text>
      <Text style={{ fontSize: FS.sm, color: valueColor || Colors.gray900, fontWeight: FW.bold }}>{value}</Text>
    </View>
  );
}

export function SettingsItem({ icon, label, onPress, danger, last }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: SP.lg, borderBottomWidth: last ? 0 : 1, borderBottomColor: Colors.gray100 }}>
      <View style={{ width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: danger ? Colors.red100 : Colors.blue50 }}>
        <Icon name={icon} size={18} color={danger ? Colors.red500 : Colors.blue500} />
      </View>
      <Text style={{ flex: 1, fontSize: FS.base, fontWeight: FW.semiBold, color: danger ? Colors.red500 : Colors.gray900 }}>{label}</Text>
      <Icon name="chevronRight" size={16} color={Colors.gray300} />
    </TouchableOpacity>
  );
}

export function Switch({ value, onChange }) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: value ? Colors.blue500 : Colors.gray300, padding: 3, justifyContent: 'center' }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.white, alignSelf: value ? 'flex-end' : 'flex-start' }} />
    </TouchableOpacity>
  );
}

export function StatCard({ icon, value, label, color, trend, trendUp }) {
  return (
    <View style={{ flex: 1, minWidth: '47%', backgroundColor: Colors.white, borderRadius: RAD.sm, padding: 14, borderWidth: 1, borderColor: Colors.gray100 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: (color || Colors.blue500) + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon name={icon} size={18} color={color || Colors.blue500} />
      </View>
      <Text style={{ fontSize: 19, fontWeight: FW.black, color: color || Colors.gray900 }}>{value}</Text>
      <Text style={{ fontSize: 10, color: Colors.gray400, marginTop: 3 }}>{label}</Text>
      {trend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 }}>
          <Icon name={trendUp ? 'trendUp' : 'trendDown'} size={11} color={trendUp ? Colors.green500 : Colors.red500} />
          <Text style={{ fontSize: 10, fontWeight: FW.bold, color: trendUp ? Colors.green500 : Colors.red500 }}>{trend}</Text>
        </View>
      )}
    </View>
  );
}

export function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
      <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.blue600, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon name="zap" size={30} color={Colors.white} />
      </View>
      <ActivityIndicator color={Colors.blue500} size="large" />
    </View>
  );
}

export default {
  Button, Input, Card, Badge, ConfirmBox, OTPInput, BottomSheet,
  EmptyState, Chip, InfoRow, SettingsItem, Switch, StatCard, LoadingScreen,
};
