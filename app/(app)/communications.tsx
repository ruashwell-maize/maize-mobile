import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Communications() {
  return (
    <SafeAreaView className="flex-1 bg-[#f7fafc]">
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-[24px] font-bold text-[#2d3748] mb-1">Messages</Text>
        <Text className="text-[14px] text-[#718096] mb-6">Contractor communications</Text>

        <View className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-4">
          <Text className="text-[12px] font-semibold text-[#5F7C8A] uppercase tracking-wider mb-2">Inbox</Text>
          <Text className="text-[13px] text-[#718096]">No messages yet</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
