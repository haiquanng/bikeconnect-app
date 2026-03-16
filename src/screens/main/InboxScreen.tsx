import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  RefreshControl,
  DeviceEventEmitter,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { conversationService, ApiConversation } from '../../api/conversationService';
import { socketService } from '../../services/socketService';
import { useAppSelector } from '../../redux/hooks';
import ConversationItem from '../../components/molecules/ConversationItem';
import { SCROLL_TO_TOP_EVENT } from '../../components/organisms/CustomTabBar';

type TabType = 'all' | 'unread';
type ViewMode = 'normal' | 'select' | 'hidden';

const InboxScreen = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [hiddenConversations, setHiddenConversations] = useState<ApiConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [menuVisible, setMenuVisible] = useState(false);
  const listRef = useRef<FlatList<ApiConversation>>(null);
  const idToken = useAppSelector(state => state.auth.idToken);

  useFocusEffect(
    useCallback(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      SCROLL_TO_TOP_EVENT,
      ({ routeName }) => {
        if (routeName === 'Inbox') {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      },
    );
    return () => sub.remove();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await conversationService.getConversations();
      setConversations(data);
    } catch {
      // silent
    }
  }, []);

  const loadHiddenConversations = useCallback(async () => {
    try {
      const data = await conversationService.getHiddenConversations();
      setHiddenConversations(data);
    } catch {
      // silent
    }
  }, []);

  useFocusEffect(useCallback(() => { loadConversations(); }, [loadConversations]));

  useEffect(() => {
    if (!idToken) return;
    if (!socketService.connected) socketService.connect(idToken);
    const unsub = socketService.on('new_message', () => { loadConversations(); });
    return unsub;
  }, [idToken, loadConversations]);

  // --- Actions ---
  const handleHide = useCallback(async (id: string) => {
    try {
      await conversationService.hideConversation(id);
      setConversations(prev => prev.filter(c => c._id !== id));
    } catch {
      Alert.alert('Lỗi', 'Không thể ẩn hội thoại');
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert('Xoá hội thoại', 'Bạn có chắc muốn xoá hội thoại này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive', onPress: async () => {
          try {
            await conversationService.deleteConversation(id);
            setConversations(prev => prev.filter(c => c._id !== id));
            setHiddenConversations(prev => prev.filter(c => c._id !== id));
          } catch {
            Alert.alert('Lỗi', 'Không thể xoá hội thoại');
          }
        },
      },
    ]);
  }, []);

  const handleDeleteAll = useCallback(async () => {
    Alert.alert('Xoá tất cả', 'Bạn có chắc muốn xoá tất cả hội thoại?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive', onPress: async () => {
          try {
            await conversationService.deleteAllConversations();
            setConversations([]);
            setMenuVisible(false);
          } catch {
            Alert.alert('Lỗi', 'Không thể xoá');
          }
        },
      },
    ]);
  }, []);

  const handleHideSelected = useCallback(async () => {
    try {
      await Promise.all([...selectedIds].map(id => conversationService.hideConversation(id)));
      setConversations(prev => prev.filter(c => !selectedIds.has(c._id)));
      setSelectedIds(new Set());
      setViewMode('normal');
    } catch {
      Alert.alert('Lỗi', 'Không thể ẩn hội thoại đã chọn');
    }
  }, [selectedIds]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const enterSelectMode = useCallback(() => {
    setMenuVisible(false);
    setViewMode('select');
    setSelectedIds(new Set());
  }, []);

  const enterHiddenMode = useCallback(() => {
    setMenuVisible(false);
    setViewMode('hidden');
    loadHiddenConversations();
  }, [loadHiddenConversations]);

  const exitSpecialMode = useCallback(() => {
    setViewMode('normal');
    setSelectedIds(new Set());
  }, []);

  // --- Data ---
  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unread', label: 'Chưa đọc' },
  ];

  const displayedConversations = viewMode === 'hidden'
    ? hiddenConversations
    : selectedTab === 'unread'
      ? conversations.filter(c => c.unreadCount > 0)
      : conversations;

  // --- Render ---
  const renderHeader = () => {
    if (viewMode === 'select') {
      return (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đã chọn {selectedIds.size}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.textButton} onPress={exitSpecialMode}>
              <Text style={styles.textButtonLabel}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.textButtonOutline, selectedIds.size === 0 && styles.textButtonDisabled]}
              onPress={selectedIds.size > 0 ? handleHideSelected : undefined}
            >
              <Text style={[styles.textButtonOutlineLabel, selectedIds.size === 0 && styles.textButtonDisabledLabel]}>
                Ẩn hội thoại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (viewMode === 'hidden') {
      return (
        <View style={styles.header}>
          <TouchableOpacity onPress={exitSpecialMode} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hội thoại đã ẩn</Text>
          <View style={{ width: 40 }} />
        </View>
      );
    }

    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
            <Icon name="ellipsis-vertical" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabs = () => {
    if (viewMode !== 'normal') return null;
    return (
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
              onPress={() => setSelectedTab(tab.id as TabType)}
            >
              <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (viewMode === 'hidden') {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="eye-off-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>Không có hội thoại đã ẩn</Text>
        </View>
      );
    }

    const title = selectedTab === 'unread'
      ? 'Không có tin nhắn chưa đọc'
      : 'Quản lý cuộc trò chuyện của bạn';
    const subtitle = selectedTab === 'unread'
      ? 'Tất cả tin nhắn của bạn đã được đọc'
      : 'với người mua và người bán tại đây';

    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../../assets/images/chat_empty.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
        {selectedTab !== 'unread' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.primaryButtonText}>Duyệt cửa hàng</Text>
          </TouchableOpacity>
        )}
        {selectedTab === 'unread' && (
          <TouchableOpacity style={styles.linkButton} onPress={() => setSelectedTab('all')}>
            <Text style={styles.linkButtonText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderTabs()}

      {displayedConversations.length === 0 ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          ref={listRef}
          data={displayedConversations}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              selectable={viewMode === 'select'}
              selected={selectedIds.has(item._id)}
              onSelect={toggleSelect}
              onHide={handleHide}
              onDelete={handleDelete}
              onPress={() => {
                navigation.navigate('ChatDetail', {
                  conversationId: item._id,
                  partner: {
                    _id: item.chatPartner._id,
                    fullName: item.chatPartner.fullName,
                    avatarUrl: item.chatPartner.avatarUrl,
                  },
                });
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                if (viewMode === 'hidden') await loadHiddenConversations();
                else await loadConversations();
                setRefreshing(false);
              }}
              colors={[colors.primaryGreen]}
              tintColor={colors.primaryGreen}
            />
          }
        />
      )}

      {/* 3-dot dropdown menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={enterSelectMode}>
              <Icon name="checkmark-circle-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.menuItemText}>Chọn nhiều hội thoại</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={enterHiddenMode}>
              <Icon name="eye-off-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.menuItemText}>Hội thoại đã ẩn</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAll}>
              <Icon name="trash-outline" size={20} color="#E53935" />
              <Text style={[styles.menuItemText, { color: '#E53935' }]}>Xoá tất cả chat</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  textButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  textButtonOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
  },
  textButtonOutlineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  textButtonDisabled: {
    borderColor: colors.gray[300],
  },
  textButtonDisabledLabel: {
    color: colors.gray[400],
  },
  tabsWrapper: {
    height: 56,
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    height: 32,
  },
  tabActive: {
    backgroundColor: colors.darkNavy,
    borderColor: colors.darkNavy,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  emptyImage: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primaryBlue,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  // Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContainer: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: 16,
  },
});

export default InboxScreen;
