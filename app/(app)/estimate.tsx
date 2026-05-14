import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = { role: 'user' | 'assistant'; content: string };

export default function Estimate() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m Maize AI. Tell me about your renovation — what are you planning and where is the property?' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7fafc]">
      <View className="px-5 pt-4 pb-3 border-b border-[#e2e8f0]">
        <Text className="text-[20px] font-bold text-[#2d3748]">Cost Estimator</Text>
        <Text className="text-[13px] text-[#718096]">Get an AI-powered estimate for your renovation</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5 pt-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              className={`mb-3 max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'self-end bg-[#5F7C8A]'
                  : 'self-start bg-white border border-[#e2e8f0]'
              }`}
            >
              <Text className={`text-[14px] ${msg.role === 'user' ? 'text-white' : 'text-[#2d3748]'}`}>
                {msg.content}
              </Text>
            </View>
          ))}
          <View className="h-4" />
        </ScrollView>

        <View className="flex-row items-end px-4 py-3 border-t border-[#e2e8f0] bg-white">
          <TextInput
            className="flex-1 bg-[#f7fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-[14px] text-[#2d3748] max-h-24 mr-3"
            placeholder="Describe your renovation..."
            placeholderTextColor="#a0aec0"
            multiline
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            className="bg-[#5F7C8A] rounded-2xl px-4 py-3"
            onPress={handleSend}
          >
            <Text className="text-white font-semibold text-[14px]">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
