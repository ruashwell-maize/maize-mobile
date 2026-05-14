import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

export type Milestone = {
  id:       string;
  name:     string;
  status:   string;
  due_date: string | null;
};

type Props = {
  phase:      string;
  milestones: Milestone[];
};

function dotColor(status: string): string {
  if (status === 'paid' || status === 'completed') return COLORS.success;
  if (status === 'due' || status === 'overdue')    return COLORS.danger;
  if (status === 'in_progress')                    return COLORS.amber;
  return COLORS.n400;
}

function dueLabel(due: string | null): string {
  if (!due) return 'No due date';
  const d = new Date(due);
  return `Due ${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
}

export function CriticalPath({ phase, milestones }: Props) {
  return (
    <View
      style={{
        marginHorizontal: 20, marginBottom: 14,
        backgroundColor: '#fff', borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.n200, overflow: 'hidden',
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{
          fontSize: 14, fontWeight: '600', color: COLORS.n900,
          textTransform: 'uppercase', letterSpacing: 0.7,
        }}>
          Critical path · current phase
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {phase ? (
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: COLORS.primaryLight,
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
            }}
          >
            <Text style={{
              fontSize: 11, fontWeight: '600', color: COLORS.primary,
              textTransform: 'uppercase', letterSpacing: 0.6,
            }}>
              {phase}
            </Text>
          </View>
        ) : null}

        {milestones.length === 0 ? (
          <Text style={{ fontSize: 13, color: COLORS.n500, marginTop: 12 }}>
            No milestones scheduled for this phase yet.
          </Text>
        ) : (
          <View style={{ marginTop: 12, paddingLeft: 14, position: 'relative' }}>
            <View
              style={{
                position: 'absolute', left: 5, top: 6, bottom: 6, width: 2,
                backgroundColor: COLORS.n200, borderRadius: 2,
              }}
            />
            {milestones.map(ms => (
              <View key={ms.id} style={{ flexDirection: 'row', gap: 10, paddingVertical: 8, alignItems: 'flex-start' }}>
                <View
                  style={{
                    position: 'absolute', left: -14, top: 11,
                    width: 12, height: 12, borderRadius: 6,
                    backgroundColor: dotColor(ms.status), borderWidth: 2, borderColor: dotColor(ms.status),
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '500', color: COLORS.n900, lineHeight: 18 }}>
                    {ms.name}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 2 }}>
                    {dueLabel(ms.due_date)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
