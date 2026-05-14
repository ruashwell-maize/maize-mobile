import { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Send } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

type Props = {
  busy:       boolean;
  onSend:     (text: string) => void;
  onAddPhoto: (uri: string) => void;
};

export function EstimateInput({ busy, onSend, onAddPhoto }: Props) {
  const [text, setText] = useState('');

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (res.canceled) return;
    res.assets.forEach(a => onAddPhoto(a.uri));
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setText('');
    onSend(trimmed);
  }

  return (
    <View
      style={{
        flexDirection: 'row', gap: 8, alignItems: 'flex-end',
        paddingHorizontal: 12, paddingVertical: 10,
        borderTopWidth: 1, borderTopColor: COLORS.n200,
        backgroundColor: 'rgba(255,255,255,0.97)',
      }}
    >
      <Pressable
        onPress={pickPhoto}
        style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.n300,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Camera size={20} color={COLORS.n700} strokeWidth={2} />
      </Pressable>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Describe your renovation…"
        placeholderTextColor={COLORS.n500}
        multiline
        style={{
          flex: 1, backgroundColor: COLORS.warmWhite,
          borderWidth: 1, borderColor: COLORS.n300, borderRadius: 22,
          paddingHorizontal: 14, paddingVertical: 10,
          fontSize: 14, color: COLORS.n900, minHeight: 44, maxHeight: 120,
        }}
      />
      <Pressable
        onPress={handleSend}
        disabled={busy || !text.trim()}
        style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: COLORS.primary,
          alignItems: 'center', justifyContent: 'center',
          opacity: busy || !text.trim() ? 0.6 : 1,
        }}
      >
        {busy ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" strokeWidth={2.4} />}
      </Pressable>
    </View>
  );
}
