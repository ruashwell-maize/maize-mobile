import { View, Text, Image } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export type ChatMessage = {
  id:        string;
  role:      'ai' | 'user';
  content:   string;
  photos?:   string[];
  ts:        Date;
};

function timeShort(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isYou = msg.role === 'user';

  if (msg.photos && msg.photos.length > 0) {
    return (
      <View style={{ alignSelf: 'flex-end', flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '80%' }}>
        {msg.photos.map(uri => (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width: 90, height: 90, borderRadius: 10, backgroundColor: COLORS.n200 }}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      style={{
        maxWidth: '82%',
        alignSelf: isYou ? 'flex-end' : 'flex-start',
        backgroundColor: isYou ? COLORS.primary : '#fff',
        borderWidth: isYou ? 0 : 1, borderColor: COLORS.n200,
        paddingHorizontal: 13, paddingVertical: 10,
        borderRadius: 16,
        borderTopLeftRadius: isYou ? 16 : 5,
        borderTopRightRadius: isYou ? 5 : 16,
      }}
    >
      {!isYou ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{
            width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.ai,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={10} color="#fff" strokeWidth={2.4} />
          </View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.ai }}>Maize AI</Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 14, color: isYou ? '#fff' : COLORS.n900, lineHeight: 20 }}>
        {msg.content}
      </Text>
      <Text style={{
        fontSize: 10.5, marginTop: 4, textAlign: 'right',
        color: isYou ? 'rgba(255,255,255,0.7)' : COLORS.n500,
      }}>
        {timeShort(msg.ts)}
      </Text>
    </View>
  );
}
