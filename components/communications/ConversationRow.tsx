import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/theme';

export type Conversation = {
  id:                 string;
  contractor_name:    string;
  contractor_company: string | null;
  channel:            string;
  status:             string;
  subject:            string | null;
  body:               string;
  created_at:         string;
  project_id:         string | null;
  project_name?:      string | null;
};

function initials(name: string): string {
  return name.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '·';
}

function timeShort(iso: string): string {
  const d = new Date(iso);
  const diffH = (Date.now() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short' });
}

const TONES = [
  { bg: COLORS.primaryLight, fg: COLORS.primary },
  { bg: COLORS.amberLight,   fg: COLORS.amber   },
  { bg: COLORS.successLight, fg: COLORS.success },
  { bg: COLORS.aiLight,      fg: COLORS.ai      },
];

function toneFor(name: string) {
  const sum = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return TONES[sum % TONES.length];
}

export function ConversationRow({ c }: { c: Conversation }) {
  const unread = c.status === 'unread';
  const tone = toneFor(c.contractor_name);
  return (
    <Pressable
      onPress={() => router.push(`/(app)/communications/${c.id}`)}
      style={{
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: COLORS.n200,
        minHeight: 84, backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: tone.bg,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ fontWeight: '600', fontSize: 14, color: tone.fg }}>
          {initials(c.contractor_name)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontSize: 14.5, fontWeight: '600', color: COLORS.n900 }} numberOfLines={1}>
            {c.contractor_name}
            {c.contractor_company ? <Text style={{ fontSize: 12, color: COLORS.n600, fontWeight: '400' }}>{' '}· {c.contractor_company}</Text> : null}
          </Text>
          <Text style={{
            fontSize: 11.5, color: unread ? COLORS.primary : COLORS.n500,
            fontWeight: unread ? '600' : '400',
          }}>
            {timeShort(c.created_at)}
          </Text>
        </View>
        {c.project_name ? (
          <Text style={{ fontSize: 11.5, color: COLORS.primary, fontWeight: '500', marginTop: 1 }}>
            {c.project_name}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: 13, color: unread ? COLORS.n900 : COLORS.n600,
            marginTop: 4, lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {c.body}
        </Text>
      </View>
      {unread ? (
        <View style={{
          width: 9, height: 9, borderRadius: 4.5,
          backgroundColor: COLORS.primary,
          alignSelf: 'center',
        }} />
      ) : null}
    </Pressable>
  );
}
