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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { Conversation } from '../../types/conversation';
import {
  mockSellingConversations,
  mockBuyingConversations,
} from '../../data/mockConversations';
import ConversationItem from '../../components/molecules/ConversationItem';
import { SCROLL_TO_TOP_EVENT } from '../../components/organisms/CustomTabBar';

type TabType = 'all' | 'buying' | 'selling' | 'unread';

const InboxScreen = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<Conversation>>(null);

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

  const loadConversations = useCallback(() => {
    let data: Conversation[] = [];

    switch (selectedTab) {
      case 'all':
        data = [...mockSellingConversations, ...mockBuyingConversations];
        break;
      case 'buying':
        data = mockBuyingConversations;
        break;
      case 'selling':
        data = mockSellingConversations;
        break;
      case 'unread':
        data = [...mockSellingConversations, ...mockBuyingConversations].filter(
          conv => conv.unreadCount > 0,
        );
        break;
    }

    setConversations(data);
  }, [selectedTab]);

  useEffect(() => {
    loadConversations();
  }, [selectedTab, loadConversations]);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'buying', label: 'Mua' },
    { id: 'selling', label: 'Bán' },
    { id: 'unread', label: 'Chưa đọc' },
  ];

  const renderTabs = () => (
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
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => {
    let title = '';
    let subtitle = '';
    let buttonText = '';

    switch (selectedTab) {
      case 'all':
        title = 'Quản lý cuộc trò chuyện của bạn';
        subtitle = 'với người mua và người bán tại đây';
        buttonText = 'Duyệt cửa hàng';
        break;
      case 'buying':
        title = 'Tìm sản phẩm bạn thích';
        subtitle =
          'và liên hệ với người bán để đặt câu hỏi hoặc đưa ra đề nghị';
        buttonText = 'Tới cửa hàng';
        break;
      case 'selling':
        title = 'Đăng sản phẩm bạn muốn bán';
        subtitle = 'và nhận câu hỏi cũng như đề nghị từ người mua';
        buttonText = 'Bắt đầu bán';
        break;
      case 'unread':
        title = 'Không có tin nhắn chưa đọc';
        subtitle = 'Tất cả tin nhắn của bạn đã được đọc';
        buttonText = 'Xem tất cả';
        break;
    }

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
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (selectedTab === 'selling') {
                  navigation.navigate('Sell');
                } else {
                  navigation.navigate('Shop');
                }
              }}
            >
              <Text style={styles.primaryButtonText}>{buttonText}</Text>
            </TouchableOpacity>

            {selectedTab === 'all' && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Sell')}
              >
                <Text style={styles.secondaryButtonText}>Bắt đầu bán</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {selectedTab === 'unread' && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={styles.linkButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon
              name="ellipsis-vertical"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      {conversations.length === 0 ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          ref={listRef}
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() => {
                navigation.navigate('ChatDetail', { conversation: item });
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadConversations();
                setRefreshing(false);
              }}
              colors={[colors.primaryGreen]}
              tintColor={colors.primaryGreen}
            />
          }
        />
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonsContainer: {
    gap: 12,
    alignItems: 'center',
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
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
});

export default InboxScreen;
