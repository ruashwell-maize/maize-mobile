import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export type Contract = {
  id:           string;
  title:        string;
  status:       string;
  total_value:  number;
  start_date:   string | null;
  signed_at:    string | null;
  project_id:   string;
  type_label?:  string;
  who?:         string;
};

const STATUS_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  draft:           { bg: COLORS.amberLight,   fg: COLORS.amber,   label: 'Draft'  },
  pending_review:  { bg: COLORS.amberLight,   fg: COLORS.amber,   label: 'Review' },
  active:          { bg: COLORS.successLight, fg: COLORS.success, label: 'Active' },
  signed:          { bg: COLORS.successLight, fg: COLORS.success, label: 'Signed' },
  completed:       { bg: COLORS.successLight, fg: COLORS.success, label: 'Done'   },
  expired:         { bg: COLORS.dangerLight,  fg: COLORS.danger,  label: 'Expired'},
  terminated:      { bg: COLORS.dangerLight,  fg: COLORS.danger,  label: 'Ended'  },
};

function gbp(n: number): string {
  return `£${Math.round(n).toLocaleString('en-GB')}`;
}

export function ContractCard({ c }: { c: Contract }) {
  const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.draft;
  const attention = c.status === 'draft' || c.status === 'pending_review';

  return (
    <Pressable
      onPress={() => router.push(`/(app)/contracts/${c.id}`)}
      style={{
        backgroundColor: attention ? '#FFFBF1' : '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: attention ? '#F1D6A7' : COLORS.n200,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 11, fontWeight: '600', color: COLORS.primary,
            textTransform: 'uppercase', letterSpacing: 0.7,
          }}>
            {c.type_label ?? 'Contract'}
          </Text>
          <Text style={{ fontSize: 15.5, fontWeight: '600', color: COLORS.n900, marginTop: 2, lineHeight: 20 }}>
            {c.title}
          </Text>
          {c.who ? (
            <Text style={{ fontSize: 12.5, color: COLORS.n600, marginTop: 4 }}>{c.who}</Text>
          ) : null}
        </View>
        <View
          style={{
            backgroundColor: badge.bg,
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
            flexDirection: 'row', alignItems: 'center', gap: 5,
            alignSelf: 'flex-start',
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: badge.fg }} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: badge.fg }}>{badge.label}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 12, paddingTop: 12,
          borderTopWidth: 1, borderTopColor: COLORS.n200, borderStyle: 'dashed',
        }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.2 }}>
            {gbp(c.total_value)}
          </Text>
          {attention ? (
            <Text style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 2 }}>Needs your action</Text>
          ) : null}
        </View>
        <ChevronRight size={18} color={COLORS.n500} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
