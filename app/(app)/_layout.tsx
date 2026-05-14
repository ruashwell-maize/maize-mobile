import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

type TabIconProps = { focused: boolean; icon: string; label: string };

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-1">
      <Text style={{ fontSize: 20, color: focused ? '#5F7C8A' : '#a0aec0' }}>{icon}</Text>
      <Text
        style={{
          fontSize: 10,
          marginTop: 2,
          color: focused ? '#5F7C8A' : '#a0aec0',
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🏠" label="Home" />,
        }}
      />
      <Tabs.Screen
        name="control-centre"
        options={{
          title: 'Control Centre',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📊" label="Projects" />,
        }}
      />
      <Tabs.Screen
        name="communications"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="💬" label="Messages" />,
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contracts',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📄" label="Contracts" />,
        }}
      />
      <Tabs.Screen
        name="estimate"
        options={{
          title: 'Estimate',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="💡" label="Estimate" />,
        }}
      />
    </Tabs>
  );
}
