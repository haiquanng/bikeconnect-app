import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

type TabType = 'all' | 'buying' | 'selling' | 'unread';

const InboxScreen = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [conversations] = useState([]); // Empty for now, will add mock data later

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
        buttonText = 'Duyệt cửa hàng';
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
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {conversations.length === 0 ? renderEmptyState() : null}
      </ScrollView>
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
