import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

type Props = {
  firstName: string;
  lastName:  string;
  email:     string;
  plan?:     string;
};

function initials(first: string, last: string): string {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase() || '·';
}

export function UserCard({ firstName, lastName, email, plan = 'Homeowner · Pro' }: Props) {
  return (
    <View
      style={{
        marginHorizontal: 16, marginTop: 16, marginBottom: 8,
        backgroundColor: '#fff', borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.n200,
        padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: COLORS.primaryDark,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 20 }}>
          {initials(firstName, lastName)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, fontWeight: '600', color: COLORS.n900 }}>
          {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Maize user'}
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.n600, marginTop: 1 }} numberOfLines={1}>{email}</Text>
        <View
          style={{
            marginTop: 6, alignSelf: 'flex-start',
            backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3,
            borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 5,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.primary }}>{plan}</Text>
        </View>
      </View>
    </View>
  );
}
