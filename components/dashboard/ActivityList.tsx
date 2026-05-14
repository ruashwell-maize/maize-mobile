import { View, Text } from 'react-native';
import {
  MessageSquare, Check, Camera, AlertTriangle, Sparkles,
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export type ActivityItem = {
  id:          string;
  description: string;
  actor_type:  string;
  action_type: string;
  created_at:  string;
  project_id:  string | null;
};

function tone(item: ActivityItem): { bg: string; fg: string; icon: React.ReactNode } {
  if (item.actor_type === 'ai') {
    return { bg: COLORS.aiLight, fg: COLORS.ai, icon: <Sparkles size={14} color={COLORS.ai} strokeWidth={2} /> };
  }
  if (item.action_type.includes('alert') || item.action_type.includes('risk')) {
    return { bg: COLORS.amberLight, fg: COLORS.amber, icon: <AlertTriangle size={14} color={COLORS.amber} strokeWidth={2} /> };
  }
  if (item.action_type.includes('complete')) {
    return { bg: COLORS.successLight, fg: COLORS.success, icon: <Check size={14} color={COLORS.success} strokeWidth={2.4} /> };
  }
  if (item.action_type.includes('photo') || item.action_type.includes('upload')) {
    return { bg: COLORS.primaryLight, fg: COLORS.primary, icon: <Camera size={14} color={COLORS.primary} strokeWidth={2} /> };
  }
  return { bg: COLORS.primaryLight, fg: COLORS.primary, icon: <MessageSquare size={14} color={COLORS.primary} strokeWidth={2} /> };
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  return `${d}d ago`;
}

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: COLORS.n500 }}>No recent activity yet.</Text>
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
      {items.map((item, idx) => {
        const t = tone(item);
        const isLast = idx === items.length - 1;
        return (
          <View
            key={item.id}
            style={{
              flexDirection: 'row', gap: 12, paddingVertical: 10,
              borderBottomWidth: isLast ? 0 : 1, borderBottomColor: COLORS.n200,
            }}
          >
            <View
              style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center',
              }}
            >
              {t.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: COLORS.n900, lineHeight: 18 }} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.n500, marginTop: 2 }}>
                {relativeTime(item.created_at)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
