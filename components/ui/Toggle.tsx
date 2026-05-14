import { Pressable, View } from 'react-native';
import { COLORS } from '@/constants/theme';

type Props = {
  value:    boolean;
  onChange: (next: boolean) => void;
};

export function Toggle({ value, onChange }: Props) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        width: 46, height: 28, borderRadius: 14,
        backgroundColor: value ? COLORS.primary : COLORS.n300,
        justifyContent: 'center', padding: 2,
      }}
    >
      <View
        style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: '#fff',
          transform: [{ translateX: value ? 18 : 0 }],
          shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
        }}
      />
    </Pressable>
  );
}
