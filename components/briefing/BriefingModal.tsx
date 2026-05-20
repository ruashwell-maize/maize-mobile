import React, { useState } from 'react';
import { Modal, View, ScrollView, SafeAreaView } from 'react-native';
import { COLORS } from '@/constants/theme';
import { BriefingItem } from './briefingTypes';
import { BriefingModalHeader } from './BriefingModalHeader';
import { BriefingItemCard } from './BriefingItemCard';
import { BriefingEmptyState } from './BriefingEmptyState';

interface Props {
  visible: boolean;
  items: BriefingItem[];
  firstName: string;
  userId: string;
  briefingDate: string;
  onClose: () => void;
}

export function BriefingModal({
  visible,
  items,
  firstName,
  userId,
  briefingDate,
  onClose,
}: Props) {
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  function markResponded(id: string) {
    setRespondedIds((prev) => new Set([...prev, id]));
  }

  const respondedCount = respondedIds.size;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <BriefingModalHeader
          firstName={firstName}
          totalItems={items.length}
          respondedCount={respondedCount}
          onClose={onClose}
        />

        {items.length === 0 ? (
          <BriefingEmptyState onClose={onClose} />
        ) : (
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              gap: 12,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <BriefingItemCard
                key={item.id}
                item={item}
                briefingDate={briefingDate}
                userId={userId}
                onResponded={() => markResponded(item.id)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
