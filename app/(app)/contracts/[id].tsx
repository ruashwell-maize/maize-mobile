import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Check, Download } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';

type Contract = {
  id:                 string;
  title:              string;
  status:             string;
  total_value:        number;
  start_date:         string | null;
  end_date:           string | null;
  signed_at:          string | null;
  scope_of_work:      string | null;
  warranty_period_months: number | null;
  special_conditions: string | null;
  project_id:         string;
};

type Milestone = {
  id:       string;
  name:     string;
  amount:   number;
  status:   string;
  due_date: string | null;
};

function gbp(n: number): string {
  return `£${Math.round(n).toLocaleString('en-GB')}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  draft:           { bg: COLORS.amberLight,   fg: COLORS.amber,   label: 'Draft'  },
  pending_review:  { bg: COLORS.amberLight,   fg: COLORS.amber,   label: 'Review' },
  active:          { bg: COLORS.successLight, fg: COLORS.success, label: 'Active' },
  signed:          { bg: COLORS.successLight, fg: COLORS.success, label: 'Signed' },
};

export default function ContractDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [contractRes, msRes] = await Promise.all([
      supabase.from('contracts')
        .select('id, title, status, total_value, start_date, end_date, signed_at, scope_of_work, warranty_period_months, special_conditions, project_id')
        .eq('id', id).single(),
      supabase.from('payment_milestones')
        .select('id, name, amount, status, due_date')
        .eq('contract_id', id)
        .order('due_date', { ascending: true, nullsFirst: false }),
    ]);
    if (contractRes.data) {
      setContract(contractRes.data as Contract);
      const { data: p } = await supabase.from('projects').select('name').eq('id', contractRes.data.project_id).single();
      setProjectName((p as { name?: string } | null)?.name ?? null);
    }
    setMilestones(((msRes.data ?? []) as Milestone[]));
  }, [id]);

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
  }, [load]);

  async function handleApprove() {
    if (!contract) return;
    const newStatus = contract.status === 'draft' ? 'pending_review' : 'signed';
    const { error } = await supabase.from('contracts')
      .update({ status: newStatus, signed_by_user: true, signed_at: new Date().toISOString() })
      .eq('id', contract.id);
    if (error) {
      Alert.alert('Sign failed', error.message);
    } else {
      Alert.alert('Signed', `Contract marked as ${newStatus.replace('_', ' ')}.`);
      await load();
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.warmWhite }}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!contract) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.warmWhite }}>
        <Text style={{ color: COLORS.n700 }}>Contract not found.</Text>
      </SafeAreaView>
    );
  }

  const badge = STATUS_BADGE[contract.status] ?? STATUS_BADGE.draft;

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: COLORS.warmWhite }}>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
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
          <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.7 }}>
            Contract
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.n900 }} numberOfLines={1}>
            {contract.title}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View
          style={{
            marginHorizontal: 16, marginTop: 14, marginBottom: 12,
            backgroundColor: '#fff', borderRadius: 16,
            borderWidth: 1, borderColor: COLORS.n200, padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.n500, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Contract value
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.5, marginTop: 2 }}>
                {gbp(contract.total_value)}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: badge.bg,
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
                flexDirection: 'row', alignItems: 'center', gap: 5,
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: badge.fg }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: badge.fg }}>{badge.label}</Text>
            </View>
          </View>
        </View>

        <Panel title="Key details">
          <KV k="Project"   v={projectName ?? '—'} />
          <KV k="Term"      v={`${formatDate(contract.start_date)} → ${formatDate(contract.end_date)}`} />
          <KV k="Warranty"  v={contract.warranty_period_months ? `${contract.warranty_period_months} months` : '—'} />
          <KV k="Signed"    v={formatDate(contract.signed_at)} />
        </Panel>

        <Panel title="Payment milestones">
          {milestones.length === 0 ? (
            <Text style={{ paddingHorizontal: 16, paddingBottom: 14, fontSize: 13, color: COLORS.n500 }}>
              No milestones set.
            </Text>
          ) : milestones.map((ms, idx) => (
            <MilestoneRow key={ms.id} ms={ms} first={idx === 0} />
          ))}
        </Panel>

        {contract.scope_of_work ? (
          <Panel title="Scope of work">
            <Text style={{ paddingHorizontal: 16, paddingBottom: 14, fontSize: 13, color: COLORS.n700, lineHeight: 19 }}>
              {contract.scope_of_work}
            </Text>
          </Panel>
        ) : null}
      </ScrollView>

      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 14, backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopWidth: 1, borderTopColor: COLORS.n200,
          flexDirection: 'row', gap: 10,
        }}
      >
        <Pressable
          onPress={() => Alert.alert('Coming soon', 'PDF download wired up post-launch.')}
          style={{
            height: 48, paddingHorizontal: 14, borderRadius: 12,
            backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.n300,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Download size={16} color={COLORS.n700} strokeWidth={2} />
          <Text style={{ fontWeight: '600', fontSize: 14, color: COLORS.n700 }}>PDF</Text>
        </Pressable>
        <Pressable
          onPress={handleApprove}
          disabled={contract.status === 'signed' || contract.status === 'completed'}
          style={{
            flex: 1, height: 48, borderRadius: 12,
            backgroundColor: COLORS.primary,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: contract.status === 'signed' ? 0.6 : 1,
          }}
        >
          <Check size={16} color="#fff" strokeWidth={2.4} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
            {contract.status === 'signed' || contract.status === 'completed' ? 'Signed' : 'Approve & sign'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        marginHorizontal: 16, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 14,
        borderWidth: 1, borderColor: COLORS.n200, overflow: 'hidden',
      }}
    >
      <Text style={{
        fontSize: 12.5, fontWeight: '600', color: COLORS.n600,
        textTransform: 'uppercase', letterSpacing: 0.7,
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
      }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <View
      style={{
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 9,
        borderTopWidth: 1, borderTopColor: COLORS.n200,
      }}
    >
      <Text style={{ fontSize: 13.5, color: COLORS.n600 }}>{k}</Text>
      <Text style={{ fontSize: 13.5, color: COLORS.n900, fontWeight: '500', textAlign: 'right', maxWidth: '60%' }} numberOfLines={1}>
        {v}
      </Text>
    </View>
  );
}

function MilestoneRow({ ms, first }: { ms: Milestone; first: boolean }) {
  const done = ms.status === 'paid' || ms.status === 'completed';
  const due  = ms.status === 'due' || ms.status === 'overdue';
  const indColor = done ? COLORS.success : due ? COLORS.amber : COLORS.n400;
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 11,
        borderTopWidth: first ? 0 : 1, borderTopColor: COLORS.n200,
      }}
    >
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: indColor }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13.5, fontWeight: '500', color: done ? COLORS.n500 : COLORS.n900, textDecorationLine: done ? 'line-through' : 'none' }}>
          {ms.name}
        </Text>
        <Text style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 1 }}>
          {ms.due_date ? `Due ${formatDate(ms.due_date)}` : 'Unscheduled'}
        </Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: done ? COLORS.n500 : COLORS.n900 }}>
        {gbp(ms.amount)}
      </Text>
    </View>
  );
}
