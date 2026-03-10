import { Conversation } from '../types/conversation';

// Mock conversations for "Bán" tab (selling - chats with buyers)
export const mockSellingConversations: Conversation[] = [
  {
    id: 'conv1',
    buyerId: 'buyer1',
    buyerName: 'Nguyễn Văn A',
    buyerAvatar: 'https://i.pravatar.cc/150?img=1',
    productId: 'p001',
    productName: 'Trek Domane SL 7',
    productImage:
      'https://trek.scene7.com/is/image/TrekBicycleProducts/DomaneSL7_22_35744_A_Primary',
    lastMessage: 'Xe còn không anh? Em muốn xem trực tiếp',
    lastMessageTime: '09:41',
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: 'msg1',
        senderId: 'buyer1',
        text: 'Chào anh, xe này còn không ạ?',
        timestamp: '09:30',
        isRead: true,
      },
      {
        id: 'msg2',
        senderId: 'me',
        text: 'Còn em nhé, em muốn xem xe không?',
        timestamp: '09:35',
        isRead: true,
      },
      {
        id: 'msg3',
        senderId: 'buyer1',
        text: 'Xe còn không anh? Em muốn xem trực tiếp',
        timestamp: '09:41',
        isRead: false,
      },
    ],
  },
  {
    id: 'conv2',
    buyerId: 'buyer2',
    buyerName: 'Trần Thị B',
    buyerAvatar: 'https://i.pravatar.cc/150?img=5',
    productId: 'p002',
    productName: 'Specialized Tarmac SL7',
    productImage:
      'https://www.specialized.com/medias/Tarmac-SL7-Expert-BLK-FLORED-01.jpg',
    lastMessage: 'Giá này có thương lượng được không ạ? 😊',
    lastMessageTime: '09:22',
    unreadCount: 3,
    isOnline: true,
    messages: [
      {
        id: 'msg4',
        senderId: 'buyer2',
        text: 'Chị ơi, xe đẹp quá! Giá bao nhiêu ạ?',
        timestamp: '09:15',
        isRead: true,
      },
      {
        id: 'msg5',
        senderId: 'me',
        text: '45 triệu em nhé, xe mới 95%',
        timestamp: '09:18',
        isRead: true,
      },
      {
        id: 'msg6',
        senderId: 'buyer2',
        text: 'Giá này có thương lượng được không ạ? 😊',
        timestamp: '09:22',
        isRead: false,
      },
    ],
  },
  {
    id: 'conv3',
    buyerId: 'buyer3',
    buyerName: 'Lê Minh C',
    buyerAvatar: 'https://i.pravatar.cc/150?img=8',
    productId: 'p003',
    productName: 'Giant TCR Advanced Pro',
    productImage:
      'https://www.giant-bicycles.com/_upload/bikes/models/xxl/2023/TCR_Advanced_Pro_0_Disc.jpg',
    lastMessage: 'Xe này đi được bao lâu rồi anh? 🔥🔥🔥',
    lastMessageTime: '09:16',
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'msg7',
        senderId: 'buyer3',
        text: 'Anh ơi, cho em hỏi xe này đi được bao lâu rồi ạ?',
        timestamp: '09:10',
        isRead: true,
      },
      {
        id: 'msg8',
        senderId: 'me',
        text: 'Mới 6 tháng thôi em, còn rất mới',
        timestamp: '09:12',
        isRead: true,
      },
      {
        id: 'msg9',
        senderId: 'buyer3',
        text: 'Xe này đi được bao lâu rồi anh? 🔥🔥🔥',
        timestamp: '09:16',
        isRead: true,
      },
    ],
  },
  {
    id: 'conv4',
    buyerId: 'buyer4',
    buyerName: 'Phạm Hoàng D',
    buyerAvatar: 'https://i.pravatar.cc/150?img=12',
    productId: 'p004',
    productName: 'Cannondale SuperSix EVO',
    productImage:
      'https://www.cannondale.com/-/media/images/cannondale/bikes/road/supersix-evo/2023/supersix-evo-hi-mod-disc-ultegra-di2.jpg',
    lastMessage: 'Wow, chiếc này đẹp thật! 😍',
    lastMessageTime: 'Yesterday',
    unreadCount: 2,
    isOnline: false,
    messages: [
      {
        id: 'msg10',
        senderId: 'buyer4',
        text: 'Anh ơi, xe này còn không ạ?',
        timestamp: 'Yesterday',
        isRead: true,
      },
      {
        id: 'msg11',
        senderId: 'buyer4',
        text: 'Wow, chiếc này đẹp thật! 😍',
        timestamp: 'Yesterday',
        isRead: false,
      },
    ],
  },
  {
    id: 'conv5',
    buyerId: 'buyer5',
    buyerName: 'Hoàng Thị E',
    buyerAvatar: 'https://i.pravatar.cc/150?img=20',
    productId: 'p005',
    productName: 'Pinarello Dogma F12',
    productImage:
      'https://www.pinarello.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/dogma-f12-disk-920-paris-roubaix-2021.jpg',
    lastMessage: 'Ý tưởng hay cho lần sau 😊',
    lastMessageTime: 'Dec 20, 2024',
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'msg12',
        senderId: 'buyer5',
        text: 'Chị ơi, em muốn hỏi về xe này',
        timestamp: 'Dec 20, 2024',
        isRead: true,
      },
      {
        id: 'msg13',
        senderId: 'buyer5',
        text: 'Ý tưởng hay cho lần sau 😊',
        timestamp: 'Dec 20, 2024',
        isRead: true,
      },
    ],
  },
];

// Mock conversations for "Mua" tab (buying - chats with sellers)
export const mockBuyingConversations: Conversation[] = [];
