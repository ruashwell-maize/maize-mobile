import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  onClose: () => void;
}

export function BriefingEmptyState({ onClose }: Props) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          backgroundColor: COLORS.successLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <CheckCircle size={36} color={COLORS.success} />
      </View>

      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: COLORS.n900,
          textAlign: 'center',
          letterSpacing: -0.3,
          lineHeight: 26,
          marginBottom: 10,
        }}
      >
        Nothing needs your attention today
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: COLORS.n600,
          textAlign: 'center',
          lineHeight: 20,
          maxWidth: 280,
          marginBottom: 28,
        }}
      >
        Your projects are on track. Maize will keep an eye on things and check back in tomorrow morning.
      </Text>

      <View
        style={{
          backgroundColor: COLORS.n100,
          borderWidth: 1,
          borderColor: COLORS.n200,
          borderRadius: 12,
          padding: 14,
          width: '100%',
          maxWidth: 300,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.n700 }}>{today}</Text>
        <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
        <Text style={{ fontSize: 12, color: COLORS.n600 }}>Next check-in tomorrow, 9:00am</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 }}>
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: COLORS.success,
          }}
        />
        <Text style={{ fontSize: 12, color: COLORS.n500 }}>Maize is watching</Text>
      </View>

      <Pressable
        onPress={onClose}
        style={{
          marginTop: 32,
          backgroundColor: COLORS.primary,
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 12,
          alignSelf: 'stretch',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Close</Text>
      </Pressable>
    </View>
  );
}
