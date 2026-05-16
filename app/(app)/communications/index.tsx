import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import { ConversationRow, type Conversation } from '@/components/communications/ConversationRow';

type ProjectLite = { id: string; name: string };

const MESSAGE_TYPES = [
  'Initial outreach',
  'Follow-up',
  'Variation request',
  'Issue or complaint',
] as const;
type MessageType = typeof MESSAGE_TYPES[number];

const CHANNELS = ['WhatsApp', 'Email'] as const;
type Channel = typeof CHANNELS[number];

export default function CommunicationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

      <View style={{ height: 52, paddingBottom: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
        >
          <Chip label="All projects" active={filter === 'all'}    onPress={() => setFilter('all')} />
          {unreadCount > 0 ? (
            <Chip label={`Unread · ${unreadCount}`} active={filter === 'unread'} onPress={() => setFilter('unread')} />
          ) : null}
          {projects.map(p => (
            <Chip key={p.id} label={p.name} active={filter === p.id} onPress={() => setFilter(p.id)} />
          ))}
        </ScrollView>
      </View>

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

      {/* FAB */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: COLORS.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.22,
          shadowRadius: 8,
          elevation: 6,
          zIndex: 10,
        }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </Pressable>

      <NewMessageModal
        visible={modalVisible}
        projects={projects}
        onClose={() => setModalVisible(false)}
        onCreated={(id) => {
          setModalVisible(false);
          load();
          router.push(`/communications/${id}`);
        }}
      />
    </SafeAreaView>
  );
}

// ─── New Message Modal ────────────────────────────────────────────────────────

type NewMessageModalProps = {
  visible: boolean;
  projects: ProjectLite[];
  onClose: () => void;
  onCreated: (id: string) => void;
};

function NewMessageModal({ visible, projects, onClose, onCreated }: NewMessageModalProps) {
  const [contractorName, setContractorName] = useState('');
  const [contractorCompany, setContractorCompany] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>('Initial outreach');
  const [channel, setChannel] = useState<Channel>('WhatsApp');
  const [saving, setSaving] = useState(false);

  function reset() {
    setContractorName('');
    setContractorCompany('');
    setProjectId(null);
    setMessageType('Initial outreach');
    setChannel('WhatsApp');
    setSaving(false);
  }

  async function handleStart() {
    if (!contractorName.trim()) {
      Alert.alert('Required', 'Please enter the contractor name.');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { data, error } = await supabase.from('communications').insert({
      user_id:            user.id,
      project_id:         projectId,
      contractor_name:    contractorName.trim(),
      contractor_company: contractorCompany.trim() || null,
      channel:            channel.toLowerCase(),
      direction:          'outbound',
      status:             'draft',
      subject:            messageType,
      body:               '',
    }).select('id').single();

    setSaving(false);
    if (error || !data) {
      Alert.alert('Error', error?.message ?? 'Could not create conversation.');
      return;
    }
    reset();
    onCreated(data.id);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.warmWhite }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
            borderBottomWidth: 1, borderBottomColor: COLORS.n200,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.n900 }}>New message</Text>
            <Pressable onPress={() => { reset(); onClose(); }}>
              <Text style={{ fontSize: 15, color: COLORS.primary, fontWeight: '500' }}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Contractor name */}
            <Field label="Contractor name" required>
              <TextInput
                value={contractorName}
                onChangeText={setContractorName}
                placeholder="e.g. John Smith"
                placeholderTextColor={COLORS.n500}
                style={inputStyle}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </Field>

            {/* Contractor company */}
            <Field label="Company" hint="optional">
              <TextInput
                value={contractorCompany}
                onChangeText={setContractorCompany}
                placeholder="e.g. Smith & Sons Ltd"
                placeholderTextColor={COLORS.n500}
                style={inputStyle}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </Field>

            {/* Project */}
            {projects.length > 0 && (
              <Field label="Project" hint="optional">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {projects.map(p => (
                    <SelectChip
                      key={p.id}
                      label={p.name}
                      active={projectId === p.id}
                      onPress={() => setProjectId(prev => prev === p.id ? null : p.id)}
                    />
                  ))}
                </View>
              </Field>
            )}

            {/* Message type */}
            <Field label="Message type">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {MESSAGE_TYPES.map(t => (
                  <SelectChip
                    key={t}
                    label={t}
                    active={messageType === t}
                    onPress={() => setMessageType(t)}
                  />
                ))}
              </View>
            </Field>

            {/* Channel */}
            <Field label="Channel">
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {CHANNELS.map(c => (
                  <SelectChip
                    key={c}
                    label={c}
                    active={channel === c}
                    onPress={() => setChannel(c)}
                  />
                ))}
              </View>
            </Field>

            {/* CTA — inside the scroll so it's never squashed by flex layout */}
            <Pressable
              onPress={handleStart}
              disabled={saving}
              style={{
                backgroundColor: saving ? COLORS.primaryHover : COLORS.primary,
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
                {saving ? 'Starting…' : 'Start conversation'}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputStyle = {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: COLORS.n300,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 11,
  fontSize: 15,
  color: COLORS.n900,
};

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.n700 }}>{label}</Text>
        {required && <Text style={{ fontSize: 13, color: COLORS.danger }}>*</Text>}
        {hint && <Text style={{ fontSize: 12, color: COLORS.n500 }}>({hint})</Text>}
      </View>
      {children}
    </View>
  );
}

function SelectChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
        backgroundColor: active ? COLORS.primary : '#fff',
        borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.n300,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '500', color: active ? '#fff' : COLORS.n700 }}>{label}</Text>
    </Pressable>
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
