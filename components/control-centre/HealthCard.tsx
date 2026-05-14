import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

type Props = {
  phase:    string;
  progress: number;
  status:   string;
};

const STATUS_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  active:   { bg: COLORS.successLight, fg: COLORS.success, label: 'On track' },
  planning: { bg: COLORS.primaryLight, fg: COLORS.primary, label: 'Planning' },
  setup:    { bg: COLORS.primaryLight, fg: COLORS.primary, label: 'Setup' },
};

export function HealthCard({ phase, progress, status }: Props) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE.planning;
  return (
    <View
      style={{
        marginHorizontal: 20, marginBottom: 14,
        backgroundColor: '#fff', borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.n200, overflow: 'hidden',
      }}
    >
      <View
        style={{
          paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Text style={{
          fontSize: 14, fontWeight: '600', color: COLORS.n900,
          textTransform: 'uppercase', letterSpacing: 0.7,
        }}>
          Project health
        </Text>
        <View
          style={{
            backgroundColor: tone.bg,
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: tone.fg }}>{tone.label}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 }}>
        <Row label="Current phase" value={phase || '—'} />
        <Row label="Completion" value={`${progress}%`} />
        <View style={{ height: 8, backgroundColor: COLORS.n200, borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${Math.max(2, progress)}%`, backgroundColor: COLORS.primary }} />
        </View>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.n200,
      }}
    >
      <Text style={{ fontSize: 13, color: COLORS.n600 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.n900 }}>{value}</Text>
    </View>
  );
}
