import { View, Text, Pressable } from 'react-native';
import { Sparkles, User } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

type Style = 'ai_managed' | 'self_managed';

type Props = {
  value:    Style;
  onChange: (next: Style) => void;
};

function Option({
  active, icon, title, body, onPress,
}: {
  active:  boolean;
  icon:    React.ReactNode;
  title:   string;
  body:    string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderWidth: 1.5,
        borderColor: active ? COLORS.primary : COLORS.n200,
        borderRadius: 12,
        padding: 10,
        backgroundColor: active ? COLORS.primaryLight : COLORS.warmWhite,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={{ fontSize: 13.5, fontWeight: '600', color: COLORS.n900 }}>{title}</Text>
      </View>
      <Text style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 4, lineHeight: 16 }}>
        {body}
      </Text>
    </Pressable>
  );
}

export function ManagementStyleSegmented({ value, onChange }: Props) {
  return (
    <View
      style={{
        marginHorizontal: 16, marginBottom: 6,
        backgroundColor: '#fff', borderRadius: 14,
        borderWidth: 1, borderColor: COLORS.n200, padding: 14,
      }}
    >
      <Text style={{ fontSize: 12.5, color: COLORS.n600, lineHeight: 18 }}>
        Choose how much Maize handles for you. You can switch any time — your projects keep their state.
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Option
          active={value === 'ai_managed'}
          icon={<Sparkles size={14} color={COLORS.n900} strokeWidth={2} />}
          title="AI-managed"
          body="Maize drafts, chases, flags risks. You approve."
          onPress={() => onChange('ai_managed')}
        />
        <Option
          active={value === 'self_managed'}
          icon={<User size={14} color={COLORS.n900} strokeWidth={2} />}
          title="Self-managed"
          body="You drive. Maize tracks, reminds, never sends without you."
          onPress={() => onChange('self_managed')}
        />
      </View>
    </View>
  );
}
