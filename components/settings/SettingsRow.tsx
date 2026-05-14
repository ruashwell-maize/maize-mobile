import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

type IconTone = 'slate' | 'green' | 'amber' | 'ai' | 'danger';

const ICON_BG: Record<IconTone, string> = {
  slate:  COLORS.primaryLight,
  green:  COLORS.successLight,
  amber:  COLORS.amberLight,
  ai:     COLORS.aiLight,
  danger: COLORS.dangerLight,
};

export const ICON_FG: Record<IconTone, string> = {
  slate:  COLORS.primary,
  green:  COLORS.success,
  amber:  COLORS.amber,
  ai:     COLORS.ai,
  danger: COLORS.danger,
};

type Props = {
  icon:     React.ReactNode;
  iconTone?: IconTone;
  label:    string;
  sub?:     string;
  value?:   string;
  right?:   React.ReactNode;
  onPress?: () => void;
};

export function SettingsRow({ icon, iconTone = 'slate', label, sub, value, right, onPress }: Props) {
  const content = (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 14, paddingVertical: 12, minHeight: 52,
      }}
    >
      <View
        style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: ICON_BG[iconTone],
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14.5, fontWeight: '500', color: COLORS.n900 }}>{label}</Text>
        {sub ? <Text style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      {value ? (
        <Text style={{ fontSize: 13, color: COLORS.n600, fontWeight: '500' }} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {right ?? (onPress ? <ChevronRight size={16} color={COLORS.n400} strokeWidth={2} /> : null)}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}
