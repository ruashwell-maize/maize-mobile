import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

export type Message = {
  id:         string;
  direction:  string;
  body:       string;
  created_at: string;
  contractor_name?: string;
};

function timeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 1 && d.getDate() === now.getDate()) return 'Today';
  if (diff < 2) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

export function MessageThread({ messages }: { messages: Message[] }) {
  let lastDay = '';
  return (
    <View
      style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 10 }}
    >
      {messages.map(msg => {
        const isYou = msg.direction === 'outbound';
        const day = dayLabel(msg.created_at);
        const showDay = day !== lastDay;
        lastDay = day;
        return (
          <View key={msg.id} style={{ gap: 6 }}>
            {showDay ? (
              <View style={{ alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginVertical: 4 }}>
                <Text style={{ fontSize: 11, color: COLORS.n500, fontWeight: '500' }}>{day}</Text>
              </View>
            ) : null}
            <View
              style={{
                maxWidth: '78%',
                alignSelf: isYou ? 'flex-end' : 'flex-start',
                backgroundColor: isYou ? COLORS.primary : '#fff',
                borderWidth: isYou ? 0 : 1, borderColor: COLORS.n200,
                paddingHorizontal: 12, paddingVertical: 9,
                borderRadius: 14,
                borderTopLeftRadius: isYou ? 14 : 4,
                borderTopRightRadius: isYou ? 4 : 14,
              }}
            >
              {!isYou && msg.contractor_name ? (
                <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.primary, marginBottom: 2 }}>
                  {msg.contractor_name}
                </Text>
              ) : null}
              <Text style={{ fontSize: 13.5, color: isYou ? '#fff' : COLORS.n900, lineHeight: 19 }}>
                {msg.body}
              </Text>
              <Text style={{
                fontSize: 10.5, marginTop: 4, textAlign: 'right',
                color: isYou ? 'rgba(255,255,255,0.75)' : COLORS.n500,
              }}>
                {timeShort(msg.created_at)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
