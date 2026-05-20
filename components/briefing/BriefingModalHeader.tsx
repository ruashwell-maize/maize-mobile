import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  firstName: string;
  totalItems: number;
  respondedCount: number;
  onClose: () => void;
}

export function BriefingModalHeader({ firstName, totalItems, respondedCount, onClose }: Props) {
  const progress = totalItems > 0 ? respondedCount / totalItems : 0;

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderColor: COLORS.n200,
        backgroundColor: '#fff',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.3 }}>
            Morning briefing
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.n600, marginTop: 2 }}>
            {firstName ? `Hi ${firstName} — ` : ''}
            {totalItems === 0
              ? 'Nothing needs your attention today.'
              : `${totalItems} item${totalItems !== 1 ? 's' : ''} need${totalItems === 1 ? 's' : ''} your attention.`}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            backgroundColor: COLORS.n200,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} color={COLORS.n600} />
        </Pressable>
      </View>

      {totalItems > 0 && (
        <View style={{ marginTop: 12 }}>
          <View
            style={{
              height: 4,
              backgroundColor: COLORS.n200,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 4,
                width: `${progress * 100}%`,
                backgroundColor: COLORS.success,
                borderRadius: 2,
              }}
            />
          </View>
          <Text style={{ fontSize: 11, color: COLORS.n500, marginTop: 5 }}>
            {respondedCount} of {totalItems} addressed
          </Text>
        </View>
      )}
    </View>
  );
}
