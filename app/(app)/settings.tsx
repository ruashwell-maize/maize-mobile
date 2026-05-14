import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft, User, Mail, Phone, Bell, MessageSquare, FileText, Calendar,
  Lock, Shield, Smartphone, HelpCircle, LogOut,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import { UserCard } from '@/components/settings/UserCard';
import { ManagementStyleSegmented } from '@/components/settings/ManagementStyleSegmented';
import { SettingsRow, ICON_FG } from '@/components/settings/SettingsRow';
import { Toggle } from '@/components/ui/Toggle';

type Style = 'ai_managed' | 'self_managed';

type Profile = {
  first_name:       string;
  last_name:        string;
  phone:            string | null;
  management_style: Style;
};

const SectionLabel = ({ children }: { children: string }) => (
  <Text
    style={{
      fontSize: 11, fontWeight: '600', color: COLORS.n500,
      textTransform: 'uppercase', letterSpacing: 0.9,
      paddingHorizontal: 24, paddingTop: 18, paddingBottom: 6,
    }}
  >
    {children}
  </Text>
);

const Group = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      marginHorizontal: 16, marginBottom: 6,
      backgroundColor: '#fff', borderRadius: 14,
      borderWidth: 1, borderColor: COLORS.n200, overflow: 'hidden',
    }}
  >
    {children}
  </View>
);

export default function SettingsScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [contractActivity, setContractActivity] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [faceId, setFaceId] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? '');
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, management_style')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data as Profile);
      setLoading(false);
    })();
  }, []);

  const setStyle = useCallback(async (next: Style) => {
    if (!profile) return;
    setProfile({ ...profile, management_style: next });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ management_style: next }).eq('id', user.id);
    if (error) Alert.alert('Save failed', error.message);
  }, [profile]);

  async function handlePasswordReset() {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) Alert.alert('Reset failed', error.message);
    else Alert.alert('Email sent', `Password reset link sent to ${email}.`);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.warmWhite }}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: COLORS.warmWhite }}>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12,
          borderBottomWidth: 1, borderBottomColor: COLORS.n200,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.n200,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={18} color={COLORS.n700} strokeWidth={2.2} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.n900 }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <UserCard
          firstName={profile?.first_name ?? ''}
          lastName={profile?.last_name ?? ''}
          email={email}
        />

        <SectionLabel>Account</SectionLabel>
        <Group>
          <SettingsRow
            icon={<User size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="Name"
            value={`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || '—'}
            onPress={() => Alert.alert('Coming soon', 'Edit name on desktop for now.')}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<Mail size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="Email"
            value={email}
            onPress={() => Alert.alert('Coming soon', 'Edit email on desktop for now.')}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<Phone size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="Phone"
            value={profile?.phone ?? '—'}
            onPress={() => Alert.alert('Coming soon', 'Edit phone on desktop for now.')}
          />
        </Group>

        <SectionLabel>Management style</SectionLabel>
        <ManagementStyleSegmented
          value={profile?.management_style ?? 'self_managed'}
          onChange={setStyle}
        />

        <SectionLabel>Notifications</SectionLabel>
        <Group>
          <SettingsRow
            icon={<Bell size={16} color={ICON_FG.ai} strokeWidth={2} />}
            iconTone="ai"
            label="AI alerts"
            sub="Flagged risks & next-step prompts"
            right={<Toggle value={aiAlerts} onChange={setAiAlerts} />}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<MessageSquare size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="New messages"
            sub="From contractors and AI replies"
            right={<Toggle value={newMessages} onChange={setNewMessages} />}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<FileText size={16} color={ICON_FG.amber} strokeWidth={2} />}
            iconTone="amber"
            label="Contract activity"
            sub="Signatures, milestones, payments due"
            right={<Toggle value={contractActivity} onChange={setContractActivity} />}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<Calendar size={16} color={ICON_FG.green} strokeWidth={2} />}
            iconTone="green"
            label="Weekly digest"
            sub="Mondays 8am"
            right={<Toggle value={weeklyDigest} onChange={setWeeklyDigest} />}
          />
        </Group>

        <SectionLabel>Security</SectionLabel>
        <Group>
          <SettingsRow
            icon={<Lock size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="Change password"
            onPress={handlePasswordReset}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<Shield size={16} color={ICON_FG.ai} strokeWidth={2} />}
            iconTone="ai"
            label="Face ID for sign in"
            right={<Toggle value={faceId} onChange={setFaceId} />}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<Smartphone size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="Connected devices"
            value="2"
            onPress={() => Alert.alert('Coming soon', 'Device management coming soon.')}
          />
        </Group>

        <SectionLabel>Support</SectionLabel>
        <Group>
          <SettingsRow
            icon={<HelpCircle size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="Help & FAQs"
            onPress={() => Alert.alert('Coming soon', 'Visit bemaize.com/help.')}
          />
          <View style={{ height: 1, backgroundColor: COLORS.n200 }} />
          <SettingsRow
            icon={<FileText size={16} color={ICON_FG.slate} strokeWidth={2} />}
            label="Terms & Privacy"
            onPress={() => Alert.alert('Coming soon', 'Visit bemaize.com/legal.')}
          />
        </Group>

        <Pressable
          onPress={handleSignOut}
          style={{
            marginHorizontal: 16, marginTop: 14,
            backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.n200,
            borderRadius: 14, padding: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <LogOut size={16} color={COLORS.danger} strokeWidth={2.2} />
          <Text style={{ fontWeight: '600', fontSize: 14, color: COLORS.danger }}>Sign out</Text>
        </Pressable>

        <Text style={{ textAlign: 'center', fontSize: 11, color: COLORS.n500, paddingTop: 12 }}>
          Maize · 5.3.0 (build 412)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
