import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Layers, AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Greeting } from '@/components/dashboard/Greeting';
import { ProjectCard, type DashProject } from '@/components/dashboard/ProjectCard';
import { ActivityList, type ActivityItem } from '@/components/dashboard/ActivityList';

type Profile = {
  first_name:       string;
  last_name:        string;
  management_style: 'ai_managed' | 'self_managed';
};

const SectionHead = ({ title, action }: { title: string; action?: { label: string; onPress: () => void } }) => (
  <View
    style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
      paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10,
    }}
  >
    <Text style={{
      fontSize: 13, fontWeight: '600', color: COLORS.n600,
      textTransform: 'uppercase', letterSpacing: 1,
    }}>
      {title}
    </Text>
    {action ? (
      <Pressable onPress={action.onPress}>
        <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: '500' }}>{action.label}</Text>
      </Pressable>
    ) : null}
  </View>
);

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<DashProject[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [profileRes, projectsRes, activityRes] = await Promise.all([
      supabase.from('profiles').select('first_name, last_name, management_style').eq('id', user.id).maybeSingle(),
      supabase
        .from('projects')
        .select('id, name, renovation_type, status, phase, progress_pct')
        .in('status', ['planning', 'setup', 'active'])
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('activity_log')
        .select('id, description, actor_type, action_type, created_at, project_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
    if (profileRes.error) console.error('[dashboard] profile fetch error:', profileRes.error.message);
    if (profileRes.data) setProfile(profileRes.data as Profile);
    if (projectsRes.error) console.error('[dashboard] projects fetch error:', projectsRes.error.message);
    if (projectsRes.data) setProjects(projectsRes.data as DashProject[]);
    if (activityRes.error) console.error('[dashboard] activity fetch error:', activityRes.error.message);
    if (activityRes.data) setActivity(activityRes.data as ActivityItem[]);
  }, []);

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const firstName = profile?.first_name ?? '';
  const initials = (
    (profile?.first_name?.[0] ?? '') + (profile?.last_name?.[0] ?? '')
  ).toUpperCase() || '·';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.warmWhite }}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: COLORS.warmWhite }}>
      <DashboardHeader initials={initials} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Greeting
          firstName={firstName}
          managementStyle={profile?.management_style ?? 'self_managed'}
          activeCount={projects.filter(p => p.status === 'active').length}
        />

        <SectionHead title="Active projects" />
        {projects.length === 0 ? (
          <View
            style={{
              marginHorizontal: 20, marginBottom: 12,
              backgroundColor: '#fff', borderRadius: 16,
              borderWidth: 1, borderColor: COLORS.n200, padding: 18,
              alignItems: 'center',
            }}
          >
            <AlertTriangle size={20} color={COLORS.n500} strokeWidth={2} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.n900, marginTop: 8 }}>No active projects</Text>
            <Text style={{ fontSize: 13, color: COLORS.n600, marginTop: 2, textAlign: 'center' }}>
              Start with an estimate and convert it to a project when you're ready.
            </Text>
          </View>
        ) : (
          projects.map(p => <ProjectCard key={p.id} project={p} />)
        )}

        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 6, marginBottom: 18 }}>
          <Pressable
            onPress={() => router.push('/(app)/estimate')}
            style={{
              flex: 1, height: 48, borderRadius: 12, backgroundColor: COLORS.primary,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Plus size={16} color="#fff" strokeWidth={2.2} />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>New estimate</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/control-centre')}
            style={{
              flex: 1, height: 48, borderRadius: 12, backgroundColor: '#fff',
              borderWidth: 1, borderColor: COLORS.n200,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Layers size={16} color={COLORS.n700} strokeWidth={2} />
            <Text style={{ color: COLORS.n700, fontWeight: '600', fontSize: 13 }}>All projects</Text>
          </Pressable>
        </View>

        <SectionHead title="Recent activity" />
        <ActivityList items={activity} />
      </ScrollView>
    </SafeAreaView>
  );
}
