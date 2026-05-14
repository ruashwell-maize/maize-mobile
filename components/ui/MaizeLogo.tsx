import { View } from 'react-native';
import { COLORS } from '@/constants/theme';

type Props = { size?: number };

export function MaizeLogo({ size = 26 }: Props) {
  const radius = size * 0.31;
  const inset = size * 0.23;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: COLORS.primary,
        position: 'relative',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top:    inset,
          left:   inset,
          right:  inset,
          bottom: inset,
          backgroundColor: COLORS.warmWhite,
          borderRadius: size * 0.115,
        }}
      />
    </View>
  );
}
