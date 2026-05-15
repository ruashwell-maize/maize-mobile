import { View, Text, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

// react-native-markdown-display uses shallow style merge — overrides REPLACE
// the default style object entirely. So every block-level style must include
// the library's layout flags (flexDirection: row, flexWrap: wrap, width: '100%')
// or text won't wrap and inline children stack into a column.
const AI_MD_STYLES = {
  body:        { fontSize: 14, color: COLORS.n900, lineHeight: 20 },
  paragraph:   {
    marginTop: 0, marginBottom: 6,
    flexDirection: 'row' as const,
    flexWrap:      'wrap' as const,
    alignItems:    'flex-start' as const,
    justifyContent:'flex-start' as const,
    width:         '100%' as const,
  },
  strong:      { fontWeight: '700' as const, color: COLORS.n900 },
  em:          { fontStyle: 'italic' as const },
  heading1:    { fontSize: 16, fontWeight: '700' as const, color: COLORS.n900, marginTop: 4, marginBottom: 4, flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  heading2:    { fontSize: 15, fontWeight: '700' as const, color: COLORS.n900, marginTop: 4, marginBottom: 4, flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  heading3:    { fontSize: 14, fontWeight: '700' as const, color: COLORS.n900, marginTop: 4, marginBottom: 4, flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  bullet_list: { marginTop: 2, marginBottom: 2 },
  ordered_list:{ marginTop: 2, marginBottom: 2 },
  list_item:   { marginBottom: 2, flexDirection: 'row' as const, justifyContent: 'flex-start' as const },
  code_inline: { backgroundColor: COLORS.n100, color: COLORS.n900, paddingHorizontal: 4, borderRadius: 4, fontSize: 13 },
  link:        { color: COLORS.primary, textDecorationLine: 'underline' as const },
};

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
      {isYou ? (
        <Text style={{ fontSize: 14, color: '#fff', lineHeight: 20 }}>
          {msg.content}
        </Text>
      ) : (
        <Markdown style={AI_MD_STYLES}>{msg.content}</Markdown>
      )}
      <Text style={{
        fontSize: 10.5, marginTop: 4, textAlign: 'right',
        color: isYou ? 'rgba(255,255,255,0.7)' : COLORS.n500,
      }}>
        {timeShort(msg.ts)}
      </Text>
    </View>
  );
}
