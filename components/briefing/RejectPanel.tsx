import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  riskConsequence?: string;
  onConfirm: (reason: string) => void;
  onBack: () => void;
}

export function RejectPanel({ riskConsequence, onConfirm, onBack }: Props) {
  const [reason, setReason] = useState('');

  return (
    <View className="mt-4">
      {riskConsequence && (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            backgroundColor: COLORS.amberLight,
            borderWidth: 1,
            borderColor: COLORS.amber,
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <AlertTriangle size={16} color={COLORS.amber} style={{ marginTop: 1, flexShrink: 0 }} />
          <Text style={{ flex: 1, fontSize: 13, color: '#92400e', lineHeight: 19 }}>
            {riskConsequence}
          </Text>
        </View>
      )}

      <Text style={{ color: COLORS.n700, fontSize: 13, marginBottom: 8, fontWeight: '600' }}>
        Why are you rejecting this item?
      </Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Not relevant, already handled, incorrect…"
        placeholderTextColor={COLORS.n500}
        multiline
        style={{
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
          onPress={() => reason.trim() && onConfirm(reason.trim())}
          style={{
            flex: 2,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: reason.trim() ? COLORS.danger : COLORS.n300,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Confirm reject</Text>
        </Pressable>
      </View>
    </View>
  );
}
