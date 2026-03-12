import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { useAppSelector } from '../../redux/hooks';
import { conversationService, ApiMessage, ApiMessageBicycle } from '../../api/conversationService';
import { socketService } from '../../services/socketService';
import type { ChatDetailParams } from '../../types/conversation';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + 'đ';

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { conversationId, partner, bicycleContext }: ChatDetailParams = route.params;
  const currentUser = useAppSelector(state => state.auth.user);
  const idToken = useAppSelector(state => state.auth.idToken);

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const { messages: fetched } = await conversationService.getMessages(conversationId);
      setMessages(fetched);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Socket setup
  useEffect(() => {
    if (!idToken) return;
    if (!socketService.connected) socketService.connect(idToken);

    const unsubMessage = socketService.on('new_message', event => {
      if (event.conversationId !== conversationId) return;
      setMessages(prev => [...prev, event.message]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    const unsubTyping = socketService.on('typing', event => {
      if (event.conversationId !== conversationId) return;
      setIsTyping(true);
    });

    const unsubStopTyping = socketService.on('stop_typing', event => {
      if (event.conversationId !== conversationId) return;
      setIsTyping(false);
    });

    const unsubOnline = socketService.on('user_online', ({ userId }) => {
      if (userId === partner._id) setIsOnline(true);
    });

    const unsubOffline = socketService.on('user_offline', ({ userId }) => {
      if (userId === partner._id) setIsOnline(false);
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubStopTyping();
      unsubOnline();
      unsubOffline();
    };
  }, [conversationId, idToken, partner._id]);

  // Mark as read on focus
  useFocusEffect(
    useCallback(() => {
      conversationService.markAsRead(conversationId).catch(() => {});
    }, [conversationId]),
  );

  const handleInputChange = (text: string) => {
    setInputText(text);
    socketService.emitTyping(conversationId, partner._id);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketService.emitStopTyping(conversationId, partner._id);
    }, 1500);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText('');
    socketService.emitStopTyping(conversationId, partner._id);
    try {
      const sent = await conversationService.sendMessage(conversationId, text);
      if (sent) {
        setMessages(prev => [...prev, sent]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch {
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const handleSendProduct = async () => {
    if (!bicycleContext?.id || sending) return;
    setSending(true);
    try {
      const sent = await conversationService.sendProductMessage(conversationId, bicycleContext.id);
      if (sent) {
        setMessages(prev => [...prev, sent]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const getImageUri = (img: string | { url: string } | undefined): string | undefined => {
    if (!img) { return undefined; }
    return typeof img === 'string' ? img : img.url;
  };

  const renderProductCard = (bicycle: ApiMessageBicycle, isMe: boolean) => {
    const imageUri = getImageUri(bicycle.images?.[0]);
    return (
    <TouchableOpacity
      style={[styles.productCard, isMe ? styles.productCardMe : styles.productCardThem]}
      onPress={() => navigation.navigate('BicycleDetail', { id: bicycle._id })}
      activeOpacity={0.8}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.productImageFallback]}>
          <Icon name="bicycle-outline" size={28} color={colors.gray[400]} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{bicycle.title}</Text>
        <Text style={styles.productPrice}>{formatPrice(bicycle.price)}</Text>
        <Text style={styles.productCondition}>{bicycle.condition}</Text>
      </View>
    </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: ApiMessage }) => {
    const isMe = item.senderId === currentUser?.id;
    const bicycle = item.type === 'PRODUCT' && item.bicycleId && typeof item.bicycleId === 'object'
      ? item.bicycleId as ApiMessageBicycle
      : null;

    if (item.type === 'SYSTEM') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {bicycle ? (
          <>
            {renderProductCard(bicycle, isMe)}
            <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
              {formatTime(item.createdAt)}
            </Text>
          </>
        ) : (
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myMessageBubble : styles.theirMessageBubble,
            ]}
          >
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
              {item.content}
            </Text>
            <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarWrapper}>
            {partner.avatarUrl ? (
              <Image source={{ uri: partner.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Icon name="person" size={20} color={colors.gray[400]} />
              </View>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{partner.fullName}</Text>
            {isTyping ? (
              <Text style={styles.typingText}>Đang nhập...</Text>
            ) : isOnline ? (
              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Đang hoạt động</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="ellipsis-vertical" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primaryBlue} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item._id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Hãy bắt đầu cuộc trò chuyện</Text>
            }
          />
        )}

        {/* Bicycle context banner */}
        {bicycleContext && (
          <TouchableOpacity
            style={styles.bicycleBanner}
            onPress={() => navigation.navigate('BicycleDetail', { id: bicycleContext?.id })}
            activeOpacity={0.8}
          >
            {bicycleContext.image ? (
              <Image source={{ uri: bicycleContext.image }} style={styles.bannerImage} />
            ) : (
              <View style={[styles.bannerImage, styles.bannerImageFallback]}>
                <Icon name="bicycle-outline" size={16} color={colors.gray[400]} />
              </View>
            )}
            <View style={styles.bannerTextGroup}>
              <Text style={styles.bannerName} numberOfLines={1}>{bicycleContext.name ?? 'Xem tin đăng'}</Text>
              {bicycleContext.price != null && (
                <Text style={styles.bannerPrice}>{formatPrice(bicycleContext.price)}</Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.bannerSendBtn, sending && styles.bannerSendBtnDisabled]}
              onPress={handleSendProduct}
              disabled={sending}
            >
              <Text style={styles.bannerSendText}>Gửi tin đăng</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={colors.gray[400]}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon
                name="send"
                size={20}
                color={inputText.trim() ? colors.white : colors.gray[400]}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { marginRight: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: colors.gray[200], justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  onlineStatus: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 6 },
  onlineText: { fontSize: 12, color: colors.textSecondary },
  typingText: { fontSize: 12, color: colors.primaryBlue, fontStyle: 'italic' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  keyboardView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 14 },

  // Text messages
  messageContainer: { marginBottom: 12, maxWidth: '80%' },
  myMessageContainer: { alignSelf: 'flex-end' },
  theirMessageContainer: { alignSelf: 'flex-start' },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  myMessageBubble: { backgroundColor: colors.textPrimary, borderBottomRightRadius: 4 },
  theirMessageBubble: { backgroundColor: colors.gray[100], borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20, marginBottom: 4 },
  myMessageText: { color: colors.white },
  theirMessageText: { color: colors.textPrimary },
  messageTime: { fontSize: 11 },
  myMessageTime: { color: colors.gray[300], textAlign: 'right' },
  theirMessageTime: { color: colors.textSecondary },

  // System message
  systemMessageContainer: { alignSelf: 'center', marginBottom: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.gray[100], borderRadius: 12 },
  systemMessageText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },

  // Product card in message
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
    backgroundColor: colors.white,
    width: 260,
  },
  productCardMe: { borderColor: colors.gray[300] },
  productCardThem: { borderColor: colors.gray[200] },
  productImage: { width: 72, height: 72 },
  productImageFallback: { backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1, padding: 10 },
  productTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 4, lineHeight: 18 },
  productPrice: { fontSize: 13, fontWeight: '700', color: colors.primaryBlue, marginBottom: 2 },
  productCondition: { fontSize: 11, color: colors.textSecondary },

  bicycleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.gray[50],
    gap: 10,
  },
  bannerImage: { width: 36, height: 36, borderRadius: 6, backgroundColor: colors.gray[200] },
  bannerImageFallback: { justifyContent: 'center', alignItems: 'center' },
  bannerTextGroup: { flex: 1, justifyContent: 'center' },
  bannerName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  bannerPrice: { fontSize: 12, color: colors.primaryBlue, fontWeight: '700', marginTop: 2 },
  bannerSendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.textPrimary,
  },
  bannerSendBtnDisabled: { opacity: 0.5 },
  bannerSendText: { fontSize: 12, fontWeight: '600', color: colors.white },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: { fontSize: 15, color: colors.textPrimary, maxHeight: 80 },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.gray[200],
  },
  sendButtonActive: { backgroundColor: colors.primaryBlue },
});

export default ChatDetailScreen;
