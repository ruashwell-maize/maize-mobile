import React, { useCallback, useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Home, LayoutDashboard, MessageSquare, FileText, Calculator } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { BriefingModal } from '@/components/briefing/BriefingModal';
import { BriefingProvider } from '@/context/BriefingContext';
import { BriefingItem } from '@/components/briefing/briefingTypes';
import {
  requestNotificationPermission,
  scheduleMorningBriefing,
} from '@/lib/notifications';
import { apiFetch } from '@/constants/api';

// Convert the live API shape ({projectName, description, riskConsequence})
// to the local BriefingItem the mobile UI expects.
type ApiBriefingItem = {
  id:               string;
  type:             'update' | 'action' | 'risk' | 'decision';
  projectName?:     string;
  title:            string;
  description:      string;
  riskConsequence?: string;
};

function fromApiItem(a: ApiBriefingItem): BriefingItem {
  return {
    id:               a.id,
    type:             a.type,
    title:            a.title,
    body:             a.description,
    project_name:     a.projectName ?? 'Your projects',
    urgency:          'medium',
    risk_consequence: a.riskConsequence,
  };
}

const LAST_BRIEFING_KEY = 'maize_last_briefing_date';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AppLayout() {
  const [briefingItems, setBriefingItems] = useState<BriefingItem[]>([]);
  const [showBriefing, setShowBriefing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [userId, setUserId] = useState('');
  const [briefingDate] = useState(todayISO());

  const badgeCount = briefingItems.length;

  const openBriefing = useCallback(() => setShowBriefing(true), []);

  useEffect(() => {
    async function bootstrap() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUserId(session.user.id);

      // Fetch profile for name, management_style, briefing_time
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, management_style, briefing_time')
        .eq('id', session.user.id)
        .single();

      if (profile?.first_name) setFirstName(profile.first_name);

      // Only show briefing for ai_managed users
      if (profile?.management_style !== 'ai_managed') return;

      // Check if already shown today
      const lastDate = await SecureStore.getItemAsync(LAST_BRIEFING_KEY);
      const alreadyShownToday = lastDate === briefingDate;

      // Fetch today's briefing from the live API
      try {
        const res = await apiFetch('/api/daily-briefing');
        if (res.ok) {
          const json = await res.json() as { items: ApiBriefingItem[]; generated: boolean };
          if (json.generated) {
            setBriefingItems(json.items.map(fromApiItem));
          } else {
            setBriefingItems([]);
          }
        }
      } catch {
        // Network failure → leave items empty; modal will show empty state
        setBriefingItems([]);
      }

      // Only auto-open once per day
      if (!alreadyShownToday) {
        await SecureStore.setItemAsync(LAST_BRIEFING_KEY, briefingDate);
        setShowBriefing(true);
      }

      // Schedule morning notification
      const granted = await requestNotificationPermission();
      if (granted) {
        const briefingTime = profile?.briefing_time ?? '09:00';
        await scheduleMorningBriefing(briefingTime);
      }
    }

    bootstrap();
  }, [briefingDate]);

  function handleClose() {
    setShowBriefing(false);
  }

  return (
    <BriefingProvider value={{ badgeCount, openBriefing }}>
      <BriefingModal
        visible={showBriefing}
        items={briefingItems}
        firstName={firstName}
        userId={userId}
        briefingDate={briefingDate}
        onClose={handleClose}
      />

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
    </BriefingProvider>
  );
}
