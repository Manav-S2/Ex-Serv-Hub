import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { askAiAssistant } from '../services/aiService';

const QUICK_PROMPTS = [
  { id: '0', title: '🎖️ Retirement Procedure', query: 'Armed Forces Retirement procedural steps & transition checklist kya hai?' },
  { id: '1', title: '📌 SPARSH Life Certificate', query: 'SPARSH mein Digital Life Certificate (Jeevan Pramaan) kaise submit karein?' },
  { id: '2', title: '🏥 ECHS Card Renewal', query: 'ECHS 64-KB Smart Card kaise apply aur renew hota hai?' },
  { id: '3', title: '💰 Daughter Marriage Grant', query: 'KSB se beti ki shaadi ke liye 50,000 grant kaise milta hai?' },
  { id: '4', title: '🚗 CSD Car Quota Rules', query: 'CSD AFD portal se car khareedne ke rank-wise niyam kya hain?' },
  { id: '5', title: '📞 Emergency Helplines', query: 'Ex-Servicemen emergency helpline numbers kya hain?' },
  { id: '6', title: '📄 Download e-PPO', query: 'SPARSH portal se e-PPO kaise download karein?' },
];

export default function AiChatScreen({ onBack, initialQuery, onClearInitialQuery }) {
  const [messages, setMessages] = useState([
    {
      id: '0',
      text: 'जय हिंद, Sir! 🙏\n\nI am your verified Ex-Servicemen AI Sahayak (पूर्व सैनिक सहायक).\n\nAsk me anything about:\n• Retirement & Transition Procedures (Discharge Book, ZSB, Commutation)\n• SPARSH Pension, e-PPO & Life Certificate\n• ECHS 64-KB Card & Emergency Medical Reimbursement\n• KSB Marriage, Education & Penury Grants\n• CSD Car/Bike Quota & Entitlements\n• DGR Jobs & Resettlement Schemes',
      sender: 'ai',
      time: 'Official Guide',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      sendMessage(initialQuery.trim());
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const sendMessage = async (textToSend) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiReply = await askAiAssistant(text, messages);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiReply,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error('[AI Assistant Error]:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error connecting to the AI assistant service. Please check your network connection.',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (text) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    Alert.alert('Copied to Clipboard', 'Official guidance copied! You can paste and share with fellow veterans.');
  };

  const handleShareWhatsApp = (text) => {
    const formatted = `🇮🇳 *EX-SERVICEMEN AI SAHAYAK GUIDANCE*\n\n${text}\n\n_Shared via Ex-Servicemen App Hub_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(formatted)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp on this device.');
    });
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    sendMessage(q);
    setSearchQuery('');
  };

  return (
    <View style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#001433" />
      <AppHeader
        titlePrefix="AI SAHAYAK"
        titleHighlight="GUIDE"
        subtitle="Verified Ex-Servicemen & Pension Assistant"
        hindiText="पूर्व सैनिक सहायता • 24x7 सेवा"
        onBack={onBack}
      />

      {/* TOP SEARCH BAR */}
      <View style={styles.topSearchBarContainer}>
        <View style={styles.topSearchBar}>
          <Ionicons name="search" size={17} color="#FDC010" style={styles.searchIcon} />
          <TextInput
            style={styles.topSearchInput}
            placeholder="Search pension, SPARSH, ECHS, CSD, grants, or ask..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.searchActionBtn, !searchQuery.trim() && styles.searchActionBtnDisabled]}
            onPress={handleSearchSubmit}
            disabled={!searchQuery.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={12} color="#001433" style={{ marginRight: 3 }} />
            <Text style={styles.searchActionBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QUICK PROMPT CHIPS */}
      <View style={styles.quickPromptContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPromptScroll}
        >
          {QUICK_PROMPTS.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.quickChip}
              onPress={() => sendMessage(p.query)}
              disabled={isTyping}
            >
              <Text style={styles.quickChipText}>{p.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.chatContainer}>
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatScrollContent}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.chatBubbleWrapper,
                  isUser ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                ]}
              >
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <MaterialCommunityIcons name="robot" size={16} color="#FFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.chatBubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text style={isUser ? styles.userText : styles.aiText}>
                    {msg.text}
                  </Text>

                  <View style={styles.bubbleFooter}>
                    <Text style={[styles.timeText, isUser && { color: '#90CAF9' }]}>
                      {msg.time}
                    </Text>
                    {!isUser && (
                      <View style={styles.bubbleActionRow}>
                        <TouchableOpacity
                          onPress={() => handleShareWhatsApp(msg.text)}
                          style={styles.actionPill}
                          activeOpacity={0.7}
                        >
                          <FontAwesome5 name="whatsapp" size={11} color="#25D366" />
                          <Text style={styles.actionPillTextWhatsApp}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleCopyMessage(msg.text)}
                          style={styles.actionPill}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="copy-outline" size={11} color="#475569" />
                          <Text style={styles.actionPillText}>Copy</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={[styles.chatBubbleWrapper, styles.bubbleWrapperLeft]}>
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot" size={16} color="#FFF" />
              </View>
              <View style={[styles.chatBubble, styles.aiBubble, { paddingVertical: 10 }]}>
                <View style={styles.typingRow}>
                  <Text style={styles.typingText}>Sahayak is drafting official answer</Text>
                  <Text style={styles.dotAnimation}>...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* INPUT BAR */}
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask about Pension, ECHS, CSD, Schemes (Hindi/Eng)..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.chatSendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: '#001433',
  },
  topSearchBarContainer: {
    backgroundColor: '#071032',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  topSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  searchIcon: {
    marginRight: 6,
  },
  topSearchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 12.5,
    paddingVertical: 5,
  },
  searchClearBtn: {
    padding: 4,
    marginRight: 4,
  },
  searchActionBtn: {
    backgroundColor: '#FDC010',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  searchActionBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  searchActionBtnText: {
    color: '#001433',
    fontWeight: 'bold',
    fontSize: 11,
  },
  quickPromptContainer: {
    backgroundColor: '#071032',
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 7,
  },
  quickPromptScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  quickChipText: {
    color: '#FDC010',
    fontSize: 11,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 14,
    paddingBottom: 24,
  },
  chatBubbleWrapper: {
    marginBottom: 16,
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubbleWrapperRight: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#001433',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  chatBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: '#0D47A1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userText: {
    color: '#FFF',
    fontSize: 13.5,
    lineHeight: 20,
  },
  aiText: {
    color: '#1E293B',
    fontSize: 13.5,
    lineHeight: 20,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 6,
  },
  timeText: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  bubbleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionPillTextWhatsApp: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803D',
  },
  actionPillText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  dotAnimation: {
    fontSize: 14,
    color: '#0D47A1',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 90,
    color: '#0F172A',
    fontSize: 13.5,
  },
  chatSendBtn: {
    backgroundColor: '#001433',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
});
