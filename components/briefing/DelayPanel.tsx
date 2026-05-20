import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { COLORS } from '@/constants/theme';
import { DELAY_REASONS } from './briefingTypes';

interface Props {
  onConfirm: (reason: string) => void;
  onBack: () => void;
}

export function DelayPanel({ onConfirm, onBack }: Props) {
  const [selected, setSelected] = useState<string>('');
  const [custom, setCustom] = useState('');

  const activeReason = custom.trim() || selected;

  return (
    <View className="mt-4">
      <Text style={{ color: COLORS.n700, fontSize: 13, marginBottom: 10, fontWeight: '600' }}>
        Why are you delaying?
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
      >
        {DELAY_REASONS.map((r) => (
          <Pressable
            key={r}
            onPress={() => { setSelected(r); setCustom(''); }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: selected === r && !custom ? COLORS.primary : COLORS.n200,
              borderWidth: 1,
              borderColor: selected === r && !custom ? COLORS.primary : COLORS.n300,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: selected === r && !custom ? '#fff' : COLORS.n700,
              }}
            >
              {r}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        value={custom}
        onChangeText={(t) => { setCustom(t); setSelected(''); }}
        placeholder="Or type your own reason…"
        placeholderTextColor={COLORS.n500}
        multiline
        style={{
          marginTop: 12,
          borderWidth: 1,
          borderColor: COLORS.n300,
          borderRadius: 10,
          padding: 12,
          fontSize: 13,
          color: COLORS.n900,
          backgroundColor: COLORS.n100,
          minHeight: 64,
          textAlignVertical: 'top',
        }}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={onBack}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: COLORS.n300,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.n700 }}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => activeReason && onConfirm(activeReason)}
          style={{
            flex: 2,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: activeReason ? COLORS.primary : COLORS.n300,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Confirm delay</Text>
        </Pressable>
      </View>
    </View>
  );
}
