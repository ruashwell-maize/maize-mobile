import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

type Props = {
  total: number;
  spent: number;
};

function gbp(n: number): string {
  if (n >= 1000) return `£${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `£${Math.round(n).toLocaleString('en-GB')}`;
}

function Cell({
  label, value, tone, sub,
}: {
  label: string; value: string; tone?: 'spent' | 'remain'; sub?: string;
}) {
  const color = tone === 'remain' ? COLORS.success : COLORS.n900;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.warmWhite,
        borderWidth: 1, borderColor: COLORS.n200,
        borderRadius: 10, padding: 10,
      }}
    >
      <Text style={{
        fontSize: 10.5, fontWeight: '600', color: COLORS.n500,
        textTransform: 'uppercase', letterSpacing: 0.6,
      }}>
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color, marginTop: 2, letterSpacing: -0.2 }}>
        {value}
      </Text>
      {sub ? <Text style={{ fontSize: 11, color: COLORS.n600, marginTop: 1 }}>{sub}</Text> : null}
    </View>
  );
}

export function BudgetCard({ total, spent }: Props) {
  const remain = Math.max(0, total - spent);
  const spentPct = total > 0 ? Math.round((spent / total) * 100) : 0;
  const remainPct = 100 - spentPct;

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
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <Text style={{
          fontSize: 14, fontWeight: '600', color: COLORS.n900,
          textTransform: 'uppercase', letterSpacing: 0.7,
        }}>
          Budget
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Cell label="Total"  value={gbp(total)}  sub="Approved" />
          <Cell label="Spent"  value={gbp(spent)}  tone="spent"  sub={`${spentPct}%`} />
          <Cell label="Remain" value={gbp(remain)} tone="remain" sub={`${remainPct}%`} />
        </View>
        <View style={{ height: 6, backgroundColor: COLORS.n200, borderRadius: 999, marginTop: 12, overflow: 'hidden', flexDirection: 'row' }}>
          <View style={{ height: '100%', width: `${spentPct}%`, backgroundColor: COLORS.primary }} />
        </View>
      </View>
    </View>
  );
}
