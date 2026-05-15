import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Sparkles, PenLine, Send } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

type Channel = 'whatsapp' | 'email';
type Mode = 'ai' | 'manual';

type Props = {
  defaultChannel: Channel;
  onSaveDraft:    (body: string, channel: Channel) => Promise<void>;
  onSend:         (body: string, channel: Channel) => Promise<void>;
  onRequestDraft: () => Promise<string>;
};

export function Composer({ defaultChannel, onSaveDraft, onSend, onRequestDraft }: Props) {
  const [mode, setMode] = useState<Mode>('ai');
  const [channel, setChannel] = useState<Channel>(defaultChannel);
  const [text, setText] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleModeChange(next: Mode) {
    setMode(next);
    if (next === 'ai' && !text) {
      setDrafting(true);
      try { setText(await onRequestDraft()); } finally { setDrafting(false); }
    }
  }

  return (
    <View
      style={{
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.n200,
        padding: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row', backgroundColor: COLORS.n100,
          borderRadius: 10, padding: 3, marginBottom: 8,
        }}
      >
        <ModeButton active={mode === 'ai'}     icon={<Sparkles size={12} color={mode === 'ai' ? COLORS.primary : COLORS.n600} strokeWidth={2.4} />} label="Draft with AI" onPress={() => handleModeChange('ai')} />
        <ModeButton active={mode === 'manual'} icon={<PenLine size={12} color={mode === 'manual' ? COLORS.primary : COLORS.n600} strokeWidth={2} />}  label="Write my own" onPress={() => handleModeChange('manual')} />
      </View>

      <View
        style={{
          backgroundColor: COLORS.warmWhite,
          borderWidth: 1, borderColor: COLORS.n200, borderRadius: 12,
          padding: 10, minHeight: 64, position: 'relative',
        }}
      >
        {mode === 'ai' ? (
          <Text style={{
            position: 'absolute', top: -9, left: 10,
            fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6,
            textTransform: 'uppercase', color: COLORS.ai,
            backgroundColor: COLORS.warmWhite, paddingHorizontal: 6,
          }}>
            AI draft
          </Text>
        ) : null}
        {drafting ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size="small" color={COLORS.ai} />
            <Text style={{ fontSize: 13, color: COLORS.n600 }}>Maize is drafting…</Text>
          </View>
        ) : (
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a reply…"
            placeholderTextColor={COLORS.n500}
            multiline
            style={{ fontSize: 13, color: COLORS.n900, lineHeight: 18, minHeight: 44 }}
          />
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 8 }}>
        <View style={{ flexDirection: 'row', backgroundColor: COLORS.n100, borderRadius: 8, padding: 2 }}>
          <ChannelButton active={channel === 'whatsapp'} dotColor={COLORS.wa}      label="WhatsApp" onPress={() => setChannel('whatsapp')} />
          <ChannelButton active={channel === 'email'}    dotColor={COLORS.primary} label="Email"    onPress={() => setChannel('email')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pressable
            onPress={async () => { setBusy(true); await onSaveDraft(text, channel); setBusy(false); }}
            disabled={busy || !text}
            style={{
              backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.n300,
              paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '500', color: COLORS.n700 }}>Save</Text>
          </Pressable>
          <Pressable
            onPress={async () => { setBusy(true); await onSend(text, channel); setText(''); setBusy(false); }}
            disabled={busy || !text}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
              flexDirection: 'row', alignItems: 'center', gap: 4,
              opacity: busy || !text ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Send</Text>
            <Send size={12} color="#fff" strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ModeButton({ active, icon, label, onPress }: { active: boolean; icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: active ? '#fff' : 'transparent',
      }}
    >
      {icon}
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? COLORS.primary : COLORS.n600 }}>{label}</Text>
    </Pressable>
  );
}

function ChannelButton({ active, dotColor, label, onPress }: { active: boolean; dotColor: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: active ? '#fff' : 'transparent',
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />
      <Text style={{ fontSize: 11.5, fontWeight: '600', color: active ? COLORS.n900 : COLORS.n600 }}>{label}</Text>
    </Pressable>
  );
}
