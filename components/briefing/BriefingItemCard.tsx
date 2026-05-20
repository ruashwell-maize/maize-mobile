import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CheckCircle, Clock, X } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { BriefingItem, TYPE_CONFIG } from './briefingTypes';
import { DelayPanel } from './DelayPanel';
import { RejectPanel } from './RejectPanel';
import { supabase } from '@/lib/supabase';

type CardState = 'idle' | 'delaying' | 'rejecting' | 'done';

interface Props {
  item: BriefingItem;
  briefingDate: string;
  userId: string;
  onResponded: () => void;
}

export function BriefingItemCard({ item, briefingDate, userId, onResponded }: Props) {
  const [cardState, setCardState] = useState<CardState>('idle');
  const cfg = TYPE_CONFIG[item.type];

  async function persist(
    response: 'acted' | 'delayed' | 'rejected',
    delayReason?: string,
    rejectReason?: string,
  ) {
    await supabase.from('briefing_responses').insert({
      user_id: userId,
      briefing_date: briefingDate,
      item_type: item.type,
      item_title: item.title,
      response,
      delay_reason: delayReason ?? null,
      reject_reason: rejectReason ?? null,
      risk_consequence_shown: item.risk_consequence != null,
      responded_at: new Date().toISOString(),
    });
  }

  async function handleAct() {
    await persist('acted');
    setCardState('done');
    onResponded();
  }

  async function handleDelayConfirm(reason: string) {
    await persist('delayed', reason);
    setCardState('done');
    onResponded();
  }

  async function handleRejectConfirm(reason: string) {
    await persist('rejected', undefined, reason);
    setCardState('done');
    onResponded();
  }

  if (cardState === 'done') {
    return (
      <View
        style={{
          backgroundColor: COLORS.n100,
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: COLORS.n200,
          opacity: 0.5,
        }}
      >
        <Text style={{ fontSize: 13, color: COLORS.n600, textAlign: 'center' }}>
          Responded — Maize has noted this.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.n200,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {/* Type badge strip */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 6,
          gap: 8,
        }}
      >
        <View
          style={{
            backgroundColor: cfg.bg,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.color, letterSpacing: 0.4 }}>
            {cfg.label.toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.n500 }}>{item.project_name}</Text>
      </View>

      {/* Title + body */}
      <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.n900, lineHeight: 21 }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.n700, marginTop: 4, lineHeight: 19 }}>
          {item.body}
        </Text>
        {item.suggested_action && (
          <Text style={{ fontSize: 12, color: cfg.color, marginTop: 6, fontWeight: '600' }}>
            → {item.suggested_action}
          </Text>
        )}
      </View>

      {/* Action row or sub-panel */}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: COLORS.n200,
          padding: 12,
        }}
      >
        {cardState === 'idle' && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handleAct}
              style={{
                flex: 2,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: cfg.color,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckCircle size={14} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Act on this</Text>
            </Pressable>
            <Pressable
              onPress={() => setCardState('delaying')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: COLORS.n200,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Clock size={13} color={COLORS.n600} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.n700 }}>Delay</Text>
            </Pressable>
            <Pressable
              onPress={() => setCardState('rejecting')}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: COLORS.n200,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} color={COLORS.n600} />
            </Pressable>
          </View>
        )}

        {cardState === 'delaying' && (
          <DelayPanel
            onConfirm={handleDelayConfirm}
            onBack={() => setCardState('idle')}
          />
        )}

        {cardState === 'rejecting' && (
          <RejectPanel
            riskConsequence={item.risk_consequence}
            onConfirm={handleRejectConfirm}
            onBack={() => setCardState('idle')}
          />
        )}
      </View>
    </View>
  );
}
