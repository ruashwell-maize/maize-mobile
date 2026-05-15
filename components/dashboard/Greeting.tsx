import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

type Props = {
  firstName:       string;
  managementStyle: 'ai_managed' | 'self_managed';
  activeCount:     number;
};

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function Greeting({ firstName, managementStyle, activeCount }: Props) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.3, lineHeight: 30 }}>
        {timeOfDay()}{firstName ? `, ${firstName}.` : '.'}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: COLORS.aiLight, paddingHorizontal: 10, paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.ai }} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.ai }}>
            {managementStyle === 'ai_managed' ? 'AI-managed' : 'Self-managed'}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.n600 }}>
          {activeCount} active {activeCount === 1 ? 'project' : 'projects'} · {todayLabel()}
        </Text>
      </View>
    </View>
  );
}
