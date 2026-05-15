import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace('/(app)');
    }
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.warmWhite }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View
              style={{
                width: 72, height: 72, borderRadius: 20,
                backgroundColor: COLORS.primary,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
                shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View
                style={{
                  width: 44, height: 44, borderRadius: 8,
                  backgroundColor: COLORS.warmWhite,
                  opacity: 0.95,
                }}
              />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.n900 }}>Maize</Text>
            <Text style={{ fontSize: 13, color: COLORS.n600, marginTop: 4 }}>Renovations, run by AI.</Text>
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: COLORS.n700, marginBottom: 6 }}>Email</Text>
            <TextInput
              style={{
                height: 48, paddingHorizontal: 16, borderRadius: 12,
                borderWidth: 1, borderColor: COLORS.n300, backgroundColor: '#fff',
                fontSize: 15, color: COLORS.n900,
              }}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.n500}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
            />
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: COLORS.n700, marginBottom: 6 }}>Password</Text>
            <TextInput
              style={{
                height: 48, paddingHorizontal: 16, borderRadius: 12,
                borderWidth: 1, borderColor: COLORS.n300, backgroundColor: '#fff',
                fontSize: 15, color: COLORS.n900,
              }}
              placeholder="••••••••"
              placeholderTextColor={COLORS.n500}
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
            />
          </View>

          <Pressable
            onPress={handleSignIn}
            disabled={loading}
            style={({ pressed }) => ({
              height: 48, borderRadius: 12,
              backgroundColor: pressed ? COLORS.primaryHover : COLORS.primary,
              alignItems: 'center', justifyContent: 'center',
              marginTop: 8, opacity: loading ? 0.85 : 1,
            })}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Sign in</Text>
            }
          </Pressable>

          {error ? (
            <View
              style={{
                backgroundColor: COLORS.dangerLight, borderColor: COLORS.danger, borderWidth: 1,
                borderRadius: 10, padding: 12, marginTop: 12,
              }}
            >
              <Text style={{ color: COLORS.danger, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <Pressable style={{ marginTop: 8, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: COLORS.primary, fontWeight: '500', fontSize: 14 }}>Forgot password?</Text>
          </Pressable>

          <View style={{ paddingTop: 24 }}>
            <Text style={{ textAlign: 'center', fontSize: 12, color: COLORS.n500, lineHeight: 18 }}>
              By signing in you agree to our{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '500' }}>Terms</Text>
              {' '}and{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '500' }}>Privacy Policy</Text>
              .
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
