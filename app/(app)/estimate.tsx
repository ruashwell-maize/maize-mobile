import { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Sparkles, Plus, Bookmark } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { apiFetch } from '@/constants/api';
import { supabase } from '@/lib/supabase';
import { ChatBubble, type ChatMessage } from '@/components/estimate/ChatBubble';
import { EstimateInput } from '@/components/estimate/EstimateInput';

const GREETING_TEXT = "Hi 👋 What are we estimating today? Tell me about your renovation — type, location, and rough size — or send a few photos and I'll get going.";

export default function Estimate() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'g0', role: 'ai', content: GREETING_TEXT, ts: new Date() },
  ]);
  const [busy, setBusy] = useState(false);
  const [readyToEstimate, setReadyToEstimate] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const handleAddPhoto = useCallback((uri: string) => {
    setMessages(prev => [
      ...prev,
      { id: `p${Date.now()}-${Math.random()}`, role: 'user', content: '', photos: [uri], ts: new Date() },
    ]);
    scrollToEnd();
  }, [scrollToEnd]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', content: text, ts: new Date() };
    const draft = [...messages, userMsg];
    setMessages(draft);
    scrollToEnd();
    setBusy(true);
    try {
      const payload = {
        messages: draft.filter(m => !m.photos).map(m => ({ role: m.role, content: m.content })),
      };
      const res = await apiFetch('/api/estimator-chat', {
        method: 'POST',
        body:   JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as { content?: string };
      const aiText = data.content ?? "Sorry — I couldn't generate a response just now.";
      setMessages(prev => [...prev, { id: `a${Date.now()}`, role: 'ai', content: aiText, ts: new Date() }]);
      if (/enough to give you a solid estimate/i.test(aiText)) {
        setReadyToEstimate(true);
      }
      scrollToEnd();
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: `e${Date.now()}`, role: 'ai', content: 'Network hiccup — please try again in a moment.', ts: new Date() },
      ]);
    } finally {
      setBusy(false);
    }
  }, [messages, scrollToEnd]);

  async function handleConvertToProject() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name: 'New project (from estimate)', status: 'planning' })
      .select('id')
      .single();
    if (error) {
      Alert.alert('Could not create project', error.message);
      return;
    }
    Alert.alert('Project created', 'Refine on desktop for full project setup.');
    router.push(`/(app)/control-centre?id=${data.id}`);
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: COLORS.warmWhite }}>
      <View
        style={{
          paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
          borderBottomWidth: 1, borderBottomColor: COLORS.n200,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.ai,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={12} color="#fff" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.2 }}>
              Maize estimate
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.n600 }}>
              Online · typically replies in seconds
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
          {readyToEstimate ? <EstimateReadyCard onConvert={handleConvertToProject} /> : null}
        </ScrollView>
        <EstimateInput busy={busy} onSend={handleSend} onAddPhoto={handleAddPhoto} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EstimateReadyCard({ onConvert }: { onConvert: () => void }) {
  return (
    <View
      style={{
        marginTop: 4,
        backgroundColor: COLORS.aiLight,
        borderWidth: 1, borderColor: '#C9D8F7',
        borderRadius: 14, padding: 14,
      }}
    >
      <Text style={{
        fontSize: 10.5, fontWeight: '700', color: COLORS.ai,
        textTransform: 'uppercase', letterSpacing: 0.7,
      }}>
        Estimate ready
      </Text>
      <Text style={{ fontSize: 13, color: COLORS.n700, marginTop: 4, lineHeight: 18 }}>
        Refine on desktop for the full breakdown — or convert to a project now to start tracking.
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={() => Alert.alert('Saved', 'Estimate saved.')}
          style={{
            flex: 1, height: 40, borderRadius: 10,
            backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.n300,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Bookmark size={14} color={COLORS.n700} strokeWidth={2} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.n700 }}>Save</Text>
        </Pressable>
        <Pressable
          onPress={onConvert}
          style={{
            flex: 1, height: 40, borderRadius: 10,
            backgroundColor: COLORS.primary,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Plus size={14} color="#fff" strokeWidth={2.4} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Convert to project</Text>
        </Pressable>
      </View>
    </View>
  );
}
