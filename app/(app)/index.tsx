import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  return (
    <SafeAreaView className="flex-1 bg-[#f7fafc]">
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-[24px] font-bold text-[#2d3748] mb-1">Good morning</Text>
        <Text className="text-[14px] text-[#718096] mb-6">Here's your renovation overview</Text>

        <View className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-4">
          <Text className="text-[12px] font-semibold text-[#5F7C8A] uppercase tracking-wider mb-2">Active Project</Text>
          <Text className="text-[16px] font-semibold text-[#2d3748]">No active project</Text>
          <Text className="text-[13px] text-[#718096] mt-1">Create an estimate to get started</Text>
        </View>

        <View className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-4">
          <Text className="text-[12px] font-semibold text-[#5F7C8A] uppercase tracking-wider mb-2">Recent Activity</Text>
          <Text className="text-[13px] text-[#718096]">No recent activity</Text>
        </View>

        <View className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-4">
          <Text className="text-[12px] font-semibold text-[#5F7C8A] uppercase tracking-wider mb-2">AI Alerts</Text>
          <Text className="text-[13px] text-[#718096]">Nothing to flag right now</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
