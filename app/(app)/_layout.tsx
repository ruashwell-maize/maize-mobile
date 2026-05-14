import { Tabs } from 'expo-router';
import { Home, LayoutDashboard, MessageSquare, FileText, Calculator } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.n500,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: -2 },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor:  COLORS.n200,
          borderTopWidth:  1,
          height:          84,
          paddingTop:      6,
          paddingBottom:   24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home          size={size ?? 22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="control-centre"
        options={{
          title: 'Control',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size ?? 22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="communications"
        options={{
          title: 'Comms',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size ?? 22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contracts',
          tabBarIcon: ({ color, size }) => <FileText      size={size ?? 22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="estimate"
        options={{
          title: 'Estimate',
          tabBarIcon: ({ color, size }) => <Calculator    size={size ?? 22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
