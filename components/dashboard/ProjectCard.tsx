import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/theme';

export type DashProject = {
  id:                  string;
  name:                string;
  renovation_type:     string | null;
  status:              string;
  phase:               string | null;
  progress_pct:        number;
};

type Status = 'on_track' | 'at_risk' | 'planning';

function statusBadge(status: string, progress: number): { label: string; tone: Status } {
  if (status === 'planning' || status === 'setup') return { label: 'Setting up', tone: 'planning' };
  if (progress < 35) return { label: 'At risk', tone: 'at_risk' };
  return { label: 'On track', tone: 'on_track' };
}

const BADGE_BG: Record<Status, string> = {
  on_track: COLORS.successLight, at_risk: COLORS.amberLight, planning: COLORS.primaryLight,
};
const BADGE_FG: Record<Status, string> = {
  on_track: COLORS.success, at_risk: COLORS.amber, planning: COLORS.primary,
};

export function ProjectCard({ project }: { project: DashProject }) {
  const badge = statusBadge(project.status, project.progress_pct);
  const barColor = badge.tone === 'at_risk' ? COLORS.amber : COLORS.primary;

  return (
    <Pressable
      onPress={() => router.push(`/(app)/control-centre?id=${project.id}`)}
      style={{
        marginHorizontal: 20, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.n200, padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 11, fontWeight: '600', color: COLORS.primary,
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>
            {project.renovation_type || 'Renovation'}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.n900, marginTop: 2, lineHeight: 20 }}>
            {project.name}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: BADGE_BG[badge.tone],
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: BADGE_FG[badge.tone] }}>{badge.label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <Text style={{ fontSize: 12, color: COLORS.n600 }}>
          {project.phase ? `Phase · ${project.phase}` : 'In planning'}
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.n900, fontWeight: '600' }}>{project.progress_pct}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: COLORS.n200, borderRadius: 999, marginTop: 6, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${Math.max(2, project.progress_pct)}%`, backgroundColor: barColor }} />
      </View>
    </Pressable>
  );
}
