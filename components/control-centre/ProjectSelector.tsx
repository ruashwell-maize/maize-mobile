import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export type ProjectOption = { id: string; name: string };

type Props = {
  current:    ProjectOption | null;
  options:    ProjectOption[];
  onSelect:   (id: string) => void;
};

export function ProjectSelector({ current, options, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={options.length === 0}
        style={{
          marginHorizontal: 20, marginBottom: 16,
          backgroundColor: '#fff', borderRadius: 14,
          borderWidth: 1, borderColor: COLORS.n200,
          padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
        }}
      >
        <View
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: COLORS.primary,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 11, color: COLORS.n500, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600',
          }}>
            Project
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.n900, marginTop: 1 }} numberOfLines={1}>
            {current?.name ?? 'No active project'}
          </Text>
        </View>
        <ChevronDown size={18} color={COLORS.n500} strokeWidth={2.2} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
        />
        <View
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            backgroundColor: COLORS.warmWhite,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            paddingTop: 12, paddingBottom: 30, maxHeight: '70%',
          }}
        >
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.n300, marginBottom: 12 }} />
          <Text style={{ paddingHorizontal: 20, fontSize: 16, fontWeight: '600', color: COLORS.n900, marginBottom: 8 }}>
            Switch project
          </Text>
          <ScrollView>
            {options.map(opt => {
              const active = opt.id === current?.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => { onSelect(opt.id); setOpen(false); }}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 14,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    borderBottomWidth: 1, borderBottomColor: COLORS.n200,
                  }}
                >
                  <Text style={{ fontSize: 15, color: COLORS.n900, fontWeight: active ? '600' : '400' }} numberOfLines={1}>
                    {opt.name}
                  </Text>
                  {active ? <Check size={18} color={COLORS.primary} strokeWidth={2.2} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
