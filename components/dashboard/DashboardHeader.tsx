import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { MaizeLogo } from '@/components/ui/MaizeLogo';
import { useBriefing } from '@/context/BriefingContext';

type Props = {
  initials: string;
};

export function DashboardHeader({ initials }: Props) {
  const { badgeCount, openBriefing } = useBriefing();

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
          onPress={openBriefing}
          style={{ position: 'relative' }}
        >
          <View
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: badgeCount > 0 ? COLORS.ai : COLORS.aiLight,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color={badgeCount > 0 ? '#fff' : COLORS.ai} strokeWidth={2} />
          </View>
          {badgeCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: COLORS.danger,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
                borderWidth: 2,
                borderColor: COLORS.warmWhite,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', lineHeight: 12 }}>
                {badgeCount > 9 ? '9+' : badgeCount}
              </Text>
            </View>
          )}
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
