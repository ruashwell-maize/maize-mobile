import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import { ConversationRow, type Conversation } from '@/components/communications/ConversationRow';

type ProjectLite = { id: string; name: string };

export default function CommunicationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [convRes, projRes] = await Promise.all([
      supabase.from('communications')
        .select('id, contractor_name, contractor_company, channel, status, subject, body, created_at, project_id')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('projects').select('id, name').in('status', ['planning', 'setup', 'active']),
    ]);
    const projList = (projRes.data ?? []) as ProjectLite[];
    setProjects(projList);
    const projMap = Object.fromEntries(projList.map(p => [p.id, p.name]));
    const list = ((convRes.data ?? []) as Conversation[]).map(c => ({
      ...c,
      project_name: c.project_id ? projMap[c.project_id] ?? null : null,
    }));
    setConversations(list);
  }, []);

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const unreadCount = useMemo(() => conversations.filter(c => c.status === 'unread').length, [conversations]);
  const filtered = useMemo(() => {
    if (filter === 'all') return conversations;
    if (filter === 'unread') return conversations.filter(c => c.status === 'unread');
    return conversations.filter(c => c.project_id === filter);
  }, [conversations, filter]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.warmWhite }}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: COLORS.warmWhite }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.3 }}>Messages</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}
      >
        <Chip label="All projects" active={filter === 'all'}    onPress={() => setFilter('all')} />
        {unreadCount > 0 ? (
          <Chip label={`Unread · ${unreadCount}`} active={filter === 'unread'} onPress={() => setFilter('unread')} />
        ) : null}
        {projects.map(p => (
          <Chip key={p.id} label={p.name} active={filter === p.id} onPress={() => setFilter(p.id)} />
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.n200 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.n900 }}>No messages</Text>
            <Text style={{ fontSize: 13, color: COLORS.n600, marginTop: 4, textAlign: 'center' }}>
              Conversations with your contractors will appear here.
            </Text>
          </View>
        ) : (
          filtered.map(c => <ConversationRow key={c.id} c={c} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
        backgroundColor: active ? COLORS.primary : '#fff',
        borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.n200,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '500', color: active ? '#fff' : COLORS.n700 }}>{label}</Text>
    </Pressable>
  );
}
