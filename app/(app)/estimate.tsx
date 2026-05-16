import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Keyboard, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { Sparkles, Plus, Bookmark } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { apiFetch } from '@/constants/api';
import { supabase } from '@/lib/supabase';
import { ChatBubble, type ChatMessage } from '@/components/estimate/ChatBubble';
import { EstimateInput } from '@/components/estimate/EstimateInput';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function greetingText(firstName: string | null) {
  const hi = firstName ? `Hi ${firstName} 👋` : 'Hi 👋';
  return `${hi} What are we estimating today? Tell me about your renovation — type, location, and rough size — or send a few photos and I'll get going.`;
}

// Client-side guard: all four minimum categories must be present in user messages
// before the "Estimate ready" card can appear. Prevents the AI phrase triggering
// prematurely when Haiku emits it after only 1-2 exchanges with minimal data.
function hasMinimumCriteria(msgs: ChatMessage[]): boolean {
  const text = msgs.filter(m => m.role === 'user').map(m => m.content).join(' ');

  const hasType = /\bkitchen\b|\bbathroom\b|\bextension\b|\bloft\b|\brenovation\b|\bbedroom\b|\blounge\b|\bliving[\s-]room\b|\bwhole[\s-]?house\b|\bbasement\b|\bgarage\b/i.test(text);

  const hasLocation = (
    /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i.test(text) ||     // UK postcode
    /\b(?:london|manchester|birmingham|bristol|leeds|edinburgh|glasgow|liverpool|brighton|oxford|cambridge|sheffield|nottingham|leicester|coventry|newcastle|reading|portsmouth|plymouth|exeter|norwich|york)\b/i.test(text) ||
    /\b(?:hackney|islington|battersea|clapham|brixton|peckham|fulham|chelsea|shoreditch|dalston|southwark|lambeth|lewisham|greenwich|wandsworth|stratford|bermondsey)\b/i.test(text) ||
    /\bin\s+[A-Z][a-z]{2,}/i.test(text)                          // "in Manchester" etc.
  );

  const hasScope = (
    /\d+\s*(?:m²|m2|sqm|sq\.?\s*m|square\s*m(?:etre)?s?)/i.test(text) ||   // numeric area
    /\b(?:full[\s-]?gut|full[\s-]?reno|cosmetic|partial|open[\s-]plan|knock[\s-]?through|full[\s-]?overhaul|refurb)/i.test(text)
  );

  const hasQuality = /\bluxury\b|\bbespoke\b|\bhigh[\s-]end\b|\bpremium\b|\bstandard\b|\bmid[\s-]?range\b|\beconomy\b|\bcheap\b|\blow[\s-]?cost\b/i.test(text);

  return hasType && hasLocation && hasScope && hasQuality;
}

export default function Estimate() {
  return (
    <ErrorBoundary screenName="Estimate">
      <EstimateInner />
    </ErrorBoundary>
  );
}

function EstimateInner() {
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'g0', role: 'ai', content: greetingText(null), ts: new Date() },
  ]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .maybeSingle();
      const name = (data as { first_name?: string } | null)?.first_name ?? null;
      if (!name) return;
      setMessages(prev => {
        if (prev[0]?.id !== 'g0') return prev;
        return [{ ...prev[0], content: greetingText(name) }, ...prev.slice(1)];
      });
    })();
  }, []);
  const [busy, setBusy] = useState(false);
  const [readyToEstimate, setReadyToEstimate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        scrollRef.current?.scrollToEnd({ animated: false });
      } catch (e) {
        console.error('[estimate] scrollToEnd failed:', e);
      }
    });
  }, []);

  const handleAddPhoto = useCallback((uri: string) => {
    setMessages(prev => [
      ...prev,
      { id: `p${Date.now()}-${Math.random()}`, role: 'user', content: '', photos: [uri], ts: new Date() },
    ]);
    scrollToEnd();
  }, [scrollToEnd]);

  const handleSend = useCallback(async (text: string) => {
    try {
      try { Keyboard.dismiss(); } catch (e) { console.error('[estimate] Keyboard.dismiss failed:', e); }
      const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', content: text, ts: new Date() };
      const draft = [...messages, userMsg];
      setMessages(draft);
      scrollToEnd();
      setBusy(true);

      const payload = {
        messages: draft.filter(m => !m.photos).map(m => ({ role: m.role, content: m.content })),
      };

      let res: Response;
      try {
        res = await apiFetch('/api/estimator-chat', {
          method: 'POST',
          body:   JSON.stringify(payload),
        });
      } catch (netErr) {
        const e = netErr as Error & { cause?: unknown };
        console.error('[estimate] network error name:    ', e?.name);
        console.error('[estimate] network error message: ', e?.message);
        console.error('[estimate] network error toString:', String(netErr));
        console.error('[estimate] network error cause:   ', JSON.stringify(e?.cause));
        console.error('[estimate] network error stack:   ', e?.stack);
        setMessages(prev => [
          ...prev,
          { id: `e${Date.now()}`, role: 'ai', content: `Network error: ${e?.message ?? String(netErr)}`, ts: new Date() },
        ]);
        return;
      }

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '<unreadable>');
        console.error(`[estimate] API ${res.status}:`, bodyText.slice(0, 200));
        setMessages(prev => [
          ...prev,
          { id: `e${Date.now()}`, role: 'ai', content: `Server error (${res.status}). Please try again.`, ts: new Date() },
        ]);
        return;
      }

      let data: { content?: string };
      try {
        data = (await res.json()) as { content?: string };
      } catch (parseErr) {
        console.error('[estimate] JSON parse error:', parseErr);
        setMessages(prev => [
          ...prev,
          { id: `e${Date.now()}`, role: 'ai', content: 'Got an unexpected response from the server.', ts: new Date() },
        ]);
        return;
      }

      const aiText = data.content ?? "Sorry — I couldn't generate a response just now.";
      const nextMessages = [...draft, { id: `a${Date.now()}`, role: 'ai' as const, content: aiText, ts: new Date() }];
      setMessages(nextMessages);
      if (/enough to give you a solid estimate/i.test(aiText) && hasMinimumCriteria(nextMessages)) {
        setReadyToEstimate(true);
      }
      scrollToEnd();
    } catch (err) {
      console.error('[estimate] unexpected error in handleSend:', err);
      setMessages(prev => [
        ...prev,
        { id: `e${Date.now()}`, role: 'ai', content: 'Something went wrong. Please try again.', ts: new Date() },
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
        behavior="padding"
        keyboardVerticalOffset={tabBarHeight}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
          {readyToEstimate ? (
            <EstimateReadyCard
              onConvert={handleConvertToProject}
              onSave={() => showToast('Estimate saved')}
            />
          ) : null}
        </ScrollView>
        <EstimateInput busy={busy} onSend={handleSend} onAddPhoto={handleAddPhoto} />
      </KeyboardAvoidingView>

      {toast ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', top: 80, left: 0, right: 0,
            alignItems: 'center', zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.n900,
              paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{toast}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function EstimateReadyCard({ onConvert, onSave }: { onConvert: () => void; onSave: () => void }) {
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
          onPress={onSave}
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
