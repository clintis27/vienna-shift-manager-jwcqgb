
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/app/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I&apos;m your HR assistant. I can help you with:\n\n- Filling out leave request forms\n- Understanding HR policies\n- Questions about shifts and schedules\n- Information about benefits\n- Document upload guidance\n- General HR questions\n\nHow can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: userMessage.content,
          conversationHistory,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I&apos;m having trouble connecting right now. Please try again later or contact HR directly for assistance.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const quickActions = [
    { label: 'Request Leave', query: 'How do I request leave?' },
    { label: 'Upload Certificate', query: 'How do I upload a sick leave certificate?' },
    { label: 'Check Policies', query: 'What are the company leave policies?' },
    { label: 'Shift Changes', query: 'How do I request a shift change?' },
  ];

  const handleQuickAction = (query: string) => {
    setInputText(query);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <View style={[styles.aiAvatar, { backgroundColor: theme.primary }]}>
            <IconSymbol name="sparkles" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>HR Assistant</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Powered by AI
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={[styles.messageAvatar, { backgroundColor: theme.primary }]}>
                  <IconSymbol name="sparkles" size={16} color="#FFFFFF" />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user'
                    ? { backgroundColor: theme.primary }
                    : { backgroundColor: theme.card },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: message.role === 'user' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : theme.textSecondary },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              {message.role === 'user' && (
                <View style={[styles.messageAvatar, { backgroundColor: theme.primary }]}>
                  <IconSymbol name="person.fill" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.loadingWrapper}>
              <View style={[styles.messageAvatar, { backgroundColor: theme.primary }]}>
                <IconSymbol name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <View style={[styles.loadingBubble, { backgroundColor: theme.card }]}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            </View>
          )}

          {/* Quick Actions */}
          {messages.length === 1 && (
            <View style={styles.quickActionsContainer}>
              <Text style={[styles.quickActionsTitle, { color: theme.textSecondary }]}>
                Quick Actions
              </Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quickActionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => handleQuickAction(action.query)}
                  >
                    <Text style={[styles.quickActionText, { color: theme.text }]}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() && !loading ? theme.primary : theme.border },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <IconSymbol name="arrow.up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  loadingWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  loadingBubble: {
    padding: 16,
    borderRadius: 16,
  },
  quickActionsContainer: {
    marginTop: 24,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
