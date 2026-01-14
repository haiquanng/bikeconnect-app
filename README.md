# BikeConnect Mobile App

Nền tảng trung gian mua bán xe đạp thể thao đã qua sử dụng (Buycycle-like)

## 🚀 Tech Stack

- **Framework**: React Native 0.83.1
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **State Management**: Redux Toolkit
- **API Client**: Axios
- **Realtime**: Socket.IO Client
- **Authentication**: Firebase Auth + Google Sign-In
- **Media**: Cloudinary (planned)
- **Notifications**: React Native Toast Message

## 📁 Project Structure

```
src/
├── screens/              # Feature-based screens
├── components/           # Atomic Design (atoms/, molecules/, organisms/)
├── navigation/           # Navigation configuration
├── redux/               # Redux slices and store
├── api/                 # API services
├── hooks/               # Custom hooks
├── theme/               # Colors, typography, spacing
├── assets/              # Images, icons, fonts
├── config/              # App configuration
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## 🎨 Design System

### Colors

- **Primary**: `#00FF78`
- **Primary Green**: `#4CCD59`
- **Gradients**:
  - Primary: `#FB9E47` → `#2A6EF5` (bottom to top)
  - Button: `#19BF2A` → `#88FEC0` (top to bottom)

### Bottom Tab Navigation

- Home
- Shop
- Sell (Center elevated button)
- Inbox (Chat)
- Profile

## 🛠️ Setup Instructions

### Prerequisites

- Node.js >= 18
- React Native development environment
- iOS: Xcode + CocoaPods
- Android: Android Studio + JDK

### Installation

1. Install dependencies:

```bash
npm install
```

2. Install iOS pods:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

3. Run the app:

**iOS:**

```bash
npx react-native run-ios
```

**Android:**

```bash
npx react-native run-android
```

## 📝 Development Guidelines

### Naming Conventions

- **Variables/Functions**: camelCase (e.g., `primaryGreen`, `handleSubmit`)
- **Components**: PascalCase (e.g., `HomeScreen`, `CustomButton`)
- **Files**: PascalCase for components, camelCase for utilities

### Code Style

- Use TypeScript for type safety
- Follow Atomic Design principles for components
- Use custom hooks for reusable logic
- Implement debouncing/throttling for performance

## 🔧 Configuration

Update the following files with your credentials:

1. **src/config/appConfig.ts**
   - API_BASE_URL
   - FIREBASE_CONFIG
   - GOOGLE_WEB_CLIENT_ID
   - CLOUDINARY credentials

## 📱 Features (Planned)

- [ ] Google Authentication
- [ ] Product listing (Complete Bike, Frameset, E-Bike, Bike Parts)
- [ ] Product inspection workflow
- [ ] Deposit & payment system
- [ ] Real-time chat
- [ ] Push notifications
- [ ] Image/video upload

## 🎯 Next Steps

1. Add logo to splash screen
2. Configure Firebase
3. Set up Google Sign-In
4. Implement authentication flow
5. Build product listing screens
6. Integrate backend API

## 📄 License

Private project - All rights reserved
