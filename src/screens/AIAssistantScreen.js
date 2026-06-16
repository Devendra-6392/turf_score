import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ArrowLeft, Send, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import Toast from 'react-native-toast-message';

export default function AIAssistantScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'model', text: "Hi! I'm your Turf Assistant 🤖. I can help you find turfs or check your stats. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const flatListRef = useRef(null);
  const { token } = useAuth();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userText,
          history: chatHistory
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: data.reply }]);
        setChatHistory(data.history);
      } else {
        Toast.show({ type: 'error', text1: data.error || 'AI Failed' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Network error communicating with AI' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Sparkles size={20} color={Colors.primary} />
          <Text style={styles.title}>Turf Assistant</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, item.role === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !inputText.trim()}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Send size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  chatContainer: { padding: 15, paddingBottom: 30, gap: 15 },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 5 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#1a1a1a' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', gap: 10 },
  input: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 22, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, fontSize: 16, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', opacity: 0.9 }
});
