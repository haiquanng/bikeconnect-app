import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { ApiConversation } from '../../api/conversationService';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

interface ConversationItemProps {
  conversation: ApiConversation;
  onPress: () => void;
  onHide?: (id: string) => void;
  onUnhide?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const ACTION_WIDTH = 75;

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  onHide,
  onUnhide,
  onDelete,
  selectable,
  selected,
  onSelect,
}) => {
  const partner = conversation.chatPartner;
  const lastMsg = conversation.lastMessage;
  const swipeRef = useRef<SwipeableMethods>(null);

  const renderRightActions = () => (
    <View style={styles.actionsContainer}>
      {onUnhide ? (
        <TouchableOpacity
          style={[styles.actionButton, styles.actionHide]}
          onPress={() => {
            swipeRef.current?.close();
            onUnhide(conversation._id);
          }}
        >
          <Icon name="eye-outline" size={22} color={colors.white} />
          <Text style={styles.actionText}>Bỏ Ẩn</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, styles.actionHide]}
          onPress={() => {
            swipeRef.current?.close();
            onHide?.(conversation._id);
          }}
        >
          <Icon name="eye-off-outline" size={22} color={colors.white} />
          <Text style={styles.actionText}>Ẩn</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.actionButton, styles.actionDelete]}
        onPress={() => {
          swipeRef.current?.close();
          onDelete?.(conversation._id);
        }}
      >
        <Icon name="trash-outline" size={22} color={colors.white} />
        <Text style={styles.actionText}>Xoá</Text>
      </TouchableOpacity>
    </View>
  );

  const rowContent = (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={() => {
        if (selectable) {
          onSelect?.(conversation._id);
        } else {
          onPress();
        }
      }}
      onLongPress={() => onSelect?.(conversation._id)}
      activeOpacity={0.7}
    >
      {/* Checkbox in select mode */}
      {selectable && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Icon name="checkmark" size={14} color={colors.white} />}
        </View>
      )}

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {partner.avatarUrl ? (
          <Image source={{ uri: partner.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Icon name="person" size={24} color={colors.gray[400]} />
          </View>
        )}
        {conversation.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {partner.fullName}
          </Text>
          {lastMsg && <Text style={styles.time}>{formatTime(lastMsg.createdAt)}</Text>}
        </View>
        <Text
          style={[styles.message, conversation.unreadCount > 0 && styles.messageUnread]}
          numberOfLines={1}
        >
          {lastMsg?.content ?? 'Bắt đầu cuộc trò chuyện'}
        </Text>
      </View>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && !selectable && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (selectable) {
    return rowContent;
  }

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={ACTION_WIDTH}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      {rowContent}
    </ReanimatedSwipeable>
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
    alignItems: 'center',
  },
  containerSelected: {
    backgroundColor: colors.gray[50],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
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
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
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
  messageUnread: {
    fontWeight: '600',
    color: colors.textPrimary,
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
  actionsContainer: {
    width: ACTION_WIDTH * 2,
    flexDirection: 'row',
  },
  actionButton: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionHide: {
    backgroundColor: colors.gray[500],
  },
  actionDelete: {
    backgroundColor: '#E53935',
  },
  actionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConversationItem;
