import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform, Keyboard, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import { MessageThread, type Message } from '@/components/communications/MessageThread';
import { Composer } from '@/components/communications/Composer';

type Conversation = {
  id:                 string;
  contractor_name:    string;
  contractor_company: string | null;
  channel:            string;
  status:             string;
  body:               string;
  created_at:         string;
  project_id:         string | null;
  direction:          string;
};

export default function ConversationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('communications')
      .select('id, contractor_name, contractor_company, channel, status, body, created_at, project_id, direction')
      .eq('id', id)
      .single();
    if (!data) return;
    setConv(data as Conversation);
    if (data.status === 'unread') {
      await supabase.from('communications').update({ status: 'read' }).eq('id', id);
    }
    if (data.project_id) {
      const { data: proj } = await supabase.from('projects').select('name').eq('id', data.project_id).single();
      setProjectName((proj as { name?: string } | null)?.name ?? null);
    }
    const { data: peers } = await supabase
      .from('communications')
      .select('id, direction, body, created_at')
      .eq('contractor_name', data.contractor_name)
      .order('created_at', { ascending: true });
    setThread(((peers ?? []) as Message[]).map(m => ({ ...m, contractor_name: data.contractor_name })));
  }, [id]);

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
  }, [load]);

  async function handleRequestDraft() {
    // AI draft is stubbed for now — returns a contextual placeholder.
    return `Hi ${conv?.contractor_name.split(' ')[0] ?? ''} — thanks for the update, will get back to you shortly.`;
  }

  async function handleSaveDraft(body: string, channel: 'whatsapp' | 'email') {
    if (!conv || !body) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('communications').insert({
      user_id:            user.id,
      project_id:         conv.project_id,
      contractor_name:    conv.contractor_name,
      contractor_company: conv.contractor_company,
      channel,
      direction:          'outbound',
      status:             'draft',
      body,
    });
    Alert.alert('Saved', 'Draft saved.');
  }

  async function handleSend(body: string, channel: 'whatsapp' | 'email') {
    if (!conv || !body) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('communications').insert({
      user_id:            user.id,
      project_id:         conv.project_id,
      contractor_name:    conv.contractor_name,
      contractor_company: conv.contractor_company,
      channel,
      direction:          'outbound',
      status:             'sent',
      body,
    });
    if (channel === 'whatsapp') {
      await Clipboard.setStringAsync(body);
      Alert.alert('Copied', 'Message copied. Open WhatsApp to paste.');
    } else {
      const subject = encodeURIComponent(`Re: ${conv.contractor_company ?? conv.contractor_name}`);
      const url = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
      Linking.openURL(url);
    }
    Keyboard.dismiss();
    await load();
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.warmWhite }}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!conv) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.warmWhite }}>
        <Text style={{ color: COLORS.n700 }}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  // KeyboardAvoidingView wraps the entire screen (outermost) so the Composer
  // is reliably pushed above the keyboard regardless of navigator nesting depth.
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: COLORS.warmWhite }}>
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.n900 }} numberOfLines={1}>
              {conv.contractor_name}{conv.contractor_company ? ` · ${conv.contractor_company}` : ''}
            </Text>
            {projectName ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: COLORS.primaryLight,
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginTop: 2,
                }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '600', color: COLORS.primary }}>{projectName}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 16 }}
          style={{ flex: 1, backgroundColor: COLORS.warmWhite }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <MessageThread messages={thread} />
        </ScrollView>

        <Composer
          defaultChannel={conv.channel === 'email' ? 'email' : 'whatsapp'}
          onSaveDraft={handleSaveDraft}
          onSend={handleSend}
          onRequestDraft={handleRequestDraft}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
