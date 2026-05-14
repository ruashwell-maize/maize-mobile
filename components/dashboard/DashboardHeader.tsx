import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { MaizeLogo } from '@/components/ui/MaizeLogo';

type Props = {
  initials: string;
};

export function DashboardHeader({ initials }: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.warmWhite,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <MaizeLogo size={26} />
        <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.2 }}>
          Maize
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: COLORS.aiLight,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Sparkles size={20} color={COLORS.ai} strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/(app)/settings')}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: COLORS.primaryDark,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{initials}</Text>
        </Pressable>
      </View>
    </View>
  );
}
