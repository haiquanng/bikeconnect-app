import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Conversation } from '../../types/conversation';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: conversation.buyerAvatar }}
          style={styles.avatar}
        />
        {conversation.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.buyerName}
          </Text>
          <Text style={styles.time}>{conversation.lastMessageTime}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
        <Text style={styles.product} numberOfLines={1}>
          <Icon name="bicycle-outline" size={12} color={colors.textSecondary} />{' '}
          {conversation.productName}
        </Text>
      </View>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray[200],
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  product: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ConversationItem;
