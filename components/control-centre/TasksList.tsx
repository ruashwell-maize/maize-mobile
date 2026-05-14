import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

export type Task = {
  id:       string;
  title:    string;
  priority: string;
  status:   string;
  due_date: string | null;
};

type Props = { tasks: Task[] };

const PRI_COLOR: Record<string, string> = {
  high: COLORS.danger, medium: COLORS.amber, low: COLORS.n400,
};
const PRI_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  high:   { bg: COLORS.dangerLight, fg: COLORS.danger, label: 'High' },
  medium: { bg: COLORS.amberLight,  fg: COLORS.amber,  label: 'Medium' },
  low:    { bg: COLORS.primaryLight, fg: COLORS.primary, label: 'Low' },
};

function dueShort(due: string | null): string {
  if (!due) return 'No due date';
  const d = new Date(due);
  return d.toLocaleDateString('en-GB', { weekday: 'short' });
}

export function TasksList({ tasks }: Props) {
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
          Tasks · top 5
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        {tasks.length === 0 ? (
          <Text style={{ fontSize: 13, color: COLORS.n500, paddingVertical: 8 }}>No tasks yet.</Text>
        ) : tasks.map((task, idx) => {
          const badge = PRI_BADGE[task.priority] ?? PRI_BADGE.medium;
          return (
            <View
              key={task.id}
              style={{
                flexDirection: 'row', gap: 12, paddingVertical: 10, alignItems: 'flex-start',
                borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: COLORS.n200,
              }}
            >
              <View
                style={{
                  width: 6, alignSelf: 'stretch', borderRadius: 3,
                  backgroundColor: PRI_COLOR[task.priority] ?? COLORS.n300,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '500', color: COLORS.n900, lineHeight: 18 }} numberOfLines={2}>
                  {task.title}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <View
                    style={{
                      backgroundColor: badge.bg,
                      paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: badge.fg }}>{badge.label}</Text>
                  </View>
                  <Text style={{ fontSize: 11.5, color: COLORS.n600 }}>Due {dueShort(task.due_date)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
