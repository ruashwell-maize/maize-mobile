import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Sign in failed', error.message);
    } else {
      router.replace('/(app)');
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f7fafc]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-8">
        <Text className="text-[28px] font-bold text-[#2d3748] mb-2">Welcome back</Text>
        <Text className="text-[15px] text-[#718096] mb-10">Sign in to Maize</Text>

        <TextInput
          className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] text-[#2d3748] mb-4"
          placeholder="Email"
          placeholderTextColor="#a0aec0"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] text-[#2d3748] mb-6"
          placeholder="Password"
          placeholderTextColor="#a0aec0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-[#5F7C8A] rounded-xl py-4 items-center"
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white text-[15px] font-semibold">Sign in</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
