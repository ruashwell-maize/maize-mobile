import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import { ContractCard, type Contract } from '@/components/contracts/ContractCard';

type Filter = 'all' | 'attention' | 'active' | 'draft' | 'signed';

export default function ContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('contracts')
      .select('id, title, status, total_value, start_date, signed_at, project_id, contractor_id')
      .order('created_at', { ascending: false })
      .limit(50);
    setContracts((data ?? []) as Contract[]);
  }, []);

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const counts = useMemo(() => ({
    attention: contracts.filter(c => c.status === 'draft' || c.status === 'pending_review').length,
    all:       contracts.length,
  }), [contracts]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'attention': return contracts.filter(c => c.status === 'draft' || c.status === 'pending_review');
      case 'active':    return contracts.filter(c => c.status === 'active');
      case 'draft':     return contracts.filter(c => c.status === 'draft');
      case 'signed':    return contracts.filter(c => c.status === 'signed' || c.status === 'completed');
      default:          return contracts;
    }
  }, [contracts, filter]);

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
          paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.3 }}>Contracts</Text>
      </View>

      <View style={{ height: 54, paddingBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
        >
          <Chip label={`All · ${counts.all}`} active={filter === 'all'} onPress={() => setFilter('all')} />
          {counts.attention > 0 ? (
            <Chip
              label={`Awaiting you · ${counts.attention}`}
              active={filter === 'attention'}
              onPress={() => setFilter('attention')}
            />
          ) : null}
          <Chip label="Active" active={filter === 'active'} onPress={() => setFilter('active')} />
          <Chip label="Draft"  active={filter === 'draft'}  onPress={() => setFilter('draft')} />
          <Chip label="Signed" active={filter === 'signed'} onPress={() => setFilter('signed')} />
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.n900 }}>No contracts</Text>
            <Text style={{ fontSize: 13, color: COLORS.n600, marginTop: 4, textAlign: 'center' }}>
              Contracts you create on desktop will appear here.
            </Text>
          </View>
        ) : (
          filtered.map(c => <ContractCard key={c.id} c={c} />)
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
