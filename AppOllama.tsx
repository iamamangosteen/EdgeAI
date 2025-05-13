import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fetchOllamaResponse } from './services/OllamaService';



type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! Ask me anything.', sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const isThinking = useRef(false);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user' as const,
    };
  
    setMessages(prev => [userMessage, ...prev]);
    setInput('');
  
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Thinking...',
      sender: 'ai' as const,
    };
  
    setMessages(prev => [typingMessage, ...prev]);
  
    // Add logging here to confirm the request is being made
    console.log('Sending prompt to Ollama:', input);
  
    try {
      const aiReplyText = await fetchOllamaResponse(input);
  
      // Add logging to check what was received
      console.log('Received from Ollama:', aiReplyText);
  
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: aiReplyText,
        sender: 'ai' as const,
      };
  
      setMessages(prev =>
        [aiMessage, ...prev.filter(msg => msg.id !== typingMessage.id)]
      );
    } catch (err) {
      console.error('Error getting response from Ollama:', err);
      setMessages(prev =>
        [
          {
            id: (Date.now() + 3).toString(),
            text: 'Error contacting Ollama.',
            sender: 'ai' as const,
          },
          ...prev.filter(msg => msg.id !== typingMessage.id),
        ]
      );
    }
  };
  
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40} // tweak for Android
        >
          <View style={styles.flex}>
            <FlatList
              inverted
              data={messages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === 'user'
                      ? styles.userBubble
                      : styles.aiBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              )}
              contentContainerStyle={styles.chat}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                placeholder="Type a message..."
                onChangeText={setInput}
                editable={!isThinking.current}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={isThinking.current}
              >
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
  
  
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  flex: {
    flex: 1,
  },
  chat: {
    padding: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#1E88E5',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#2C2C2E',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#333',
    borderTopWidth: 1,
    backgroundColor: '#1c1c1e',
    paddingBottom: Platform.OS === 'android' ? 10 : 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 25,
    marginRight: 10,
    color: '#ffffff',
    backgroundColor: '#2a2a2a',
  },
  sendButton: {
    backgroundColor: '#3D5AFE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    justifyContent: 'center',
  },
  sendText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
