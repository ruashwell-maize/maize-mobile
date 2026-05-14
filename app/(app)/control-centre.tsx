import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';
import { ProjectSelector, type ProjectOption } from '@/components/control-centre/ProjectSelector';
import { HealthCard } from '@/components/control-centre/HealthCard';
import { CriticalPath, type Milestone } from '@/components/control-centre/CriticalPath';
import { TasksList, type Task } from '@/components/control-centre/TasksList';
import { BudgetCard } from '@/components/control-centre/BudgetCard';

type Project = {
  id:              string;
  name:            string;
  status:          string;
  phase:           string | null;
  progress_pct:    number;
  total_budget:    number | null;
  spent_to_date:   number;
};

export default function ControlCentre() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [options, setOptions] = useState<ProjectOption[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(params.id ?? null);

  const loadProject = useCallback(async (id: string) => {
    const [projectRes, tasksRes, milestonesRes] = await Promise.all([
      supabase.from('projects')
        .select('id, name, status, phase, progress_pct, total_budget, spent_to_date')
        .eq('id', id).single(),
      supabase.from('tasks')
        .select('id, title, priority, status, due_date')
        .eq('project_id', id)
        .neq('status', 'cancelled')
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(5),
      supabase.from('payment_milestones')
        .select('id, name, status, due_date')
        .eq('project_id', id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(8),
    ]);
    if (projectRes.data) setProject(projectRes.data as Project);
    setTasks((tasksRes.data ?? []) as Task[]);
    setMilestones((milestonesRes.data ?? []) as Milestone[]);
  }, []);

  const loadList = useCallback(async () => {
    const { data } = await supabase.from('projects')
      .select('id, name, status, updated_at')
      .in('status', ['planning', 'setup', 'active'])
      .order('updated_at', { ascending: false });
    const list = (data ?? []) as ProjectOption[];
    setOptions(list);
    const chosen = selectedId && list.find(p => p.id === selectedId)
      ? selectedId
      : list[0]?.id ?? null;
    if (chosen) {
      setSelectedId(chosen);
      await loadProject(chosen);
    } else {
      setProject(null);
      setTasks([]);
      setMilestones([]);
    }
  }, [loadProject, selectedId]);

  useEffect(() => {
    (async () => { await loadList(); setLoading(false); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedId) await loadProject(selectedId);
    setRefreshing(false);
  }, [loadProject, selectedId]);

  const onSelect = useCallback(async (id: string) => {
    setSelectedId(id);
    setLoading(true);
    await loadProject(id);
    setLoading(false);
  }, [loadProject]);

  if (loading && !project) {
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
          paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.n900, letterSpacing: -0.3 }}>
          Control Centre
        </Text>
        <Pressable
          style={{
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: COLORS.aiLight,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Sparkles size={20} color={COLORS.ai} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <ProjectSelector
          current={project ? { id: project.id, name: project.name } : null}
          options={options}
          onSelect={onSelect}
        />

        {project ? (
          <>
            <HealthCard
              phase={project.phase ?? 'Planning'}
              progress={project.progress_pct}
              status={project.status}
            />
            <CriticalPath phase={project.phase ?? 'Phase'} milestones={milestones} />
            <TasksList tasks={tasks} />
            <BudgetCard
              total={Number(project.total_budget ?? 0)}
              spent={Number(project.spent_to_date ?? 0)}
            />
          </>
        ) : (
          <View
            style={{
              marginHorizontal: 20, padding: 20,
              backgroundColor: '#fff', borderRadius: 16,
              borderWidth: 1, borderColor: COLORS.n200,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.n900 }}>No active project</Text>
            <Text style={{ fontSize: 13, color: COLORS.n600, marginTop: 4, textAlign: 'center' }}>
              Convert an estimate into a project to see your control centre here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
