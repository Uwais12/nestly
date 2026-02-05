# Nestly

> **Your personal content vault.** Save and organize posts from TikTok, Instagram, YouTube, and more in a beautiful, distraction-free feed.

Nestly is a native iOS app that transforms how you save and revisit content from social media. Share any post to Nestly, and it's automatically organized with smart tags, searchable metadata, and a cinematic browsing experience.

---

## ✨ Features

### 🔗 **Universal Sharing**
Share content from **any app** directly to Nestly via iOS Share Sheet:
- Instagram posts and reels
- TikTok videos
- YouTube videos
- Twitter/X posts
- Reddit threads
- Safari links
- And more!

### 🤖 **Smart Auto-Tagging**
Posts are automatically categorized using:
- AI-powered classification (OpenAI integration)
- Rule-based tagging for instant categorization
- Multi-label support (Food, Travel, Tech, Fitness, etc.)

### 🎨 **Beautiful UI**
- **Grid view** with immersive thumbnails
- **Glass morphism** design with smooth animations
- **Dark mode** optimized interface
- **Haptic feedback** for tactile interactions
- **60fps** scrolling with virtualized lists

### 🔍 **Powerful Search**
- **Full-text search** across titles, captions, and authors
- **Tag filters** with multi-select
- **Platform filters** (Instagram, TikTok, YouTube, Other)
- **Natural language** date parsing ("2 weeks ago", "yesterday")
- **Docked search rail** for quick access

### 📚 **Collections**
- Create custom collections
- Organize posts by theme or topic
- Add posts to multiple collections
- Manage from dedicated collections screen

### 🎯 **Smart Features**
- **Inbox mode** to track unread items
- **Notes** on any saved post
- **Deep linking** to native apps when possible
- **Metadata extraction** (title, caption, author, thumbnail)
- **Offline support** for saved content

---

## 🛠 Tech Stack

### Frontend
- **React Native** (0.81) with New Architecture
- **Expo** (SDK 54) for development and builds
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **React Native Reanimated** for 60fps animations
- **Expo Image** for optimized image loading

### Backend
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security
- **Supabase Edge Functions** (Deno) for serverless logic
- **OpenAI API** (optional) for AI-powered tagging

### Key Libraries
- `expo-share-intent` - iOS Share Extension integration
- `@expo-google-fonts/sora` - Custom typography
- `expo-haptics` - Native haptic feedback
- `react-native-youtube-iframe` - Embedded YouTube player
- `zod` - Runtime type validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- iOS device or simulator
- Supabase account
- (Optional) OpenAI API key for AI tagging

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nestly.git
   cd nestly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the schema: `supabase/schema.sql`
   - Deploy Edge Functions:
     ```bash
     npx supabase functions deploy unfurl
     npx supabase functions deploy classify
     ```
   - (Optional) Set `OPENAI_API_KEY` secret for AI tagging

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on iOS**
   - Press `i` for iOS simulator
   - Or scan QR code with Expo Go app on your iPhone

---

## 📱 Building for Production

### Development Build
```bash
eas build --profile development --platform ios
```

### Production Build & Submit
```bash
# Build for App Store
eas build --profile production --platform ios

# Submit to TestFlight/App Store
eas submit --platform ios --latest
```

---

## 📁 Project Structure

```
nestly/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   ├── (tabs)/              # Main tab navigation
│   │   ├── all.tsx          # Home feed (grid view)
│   │   ├── add.tsx          # Manual add link
│   │   ├── profile.tsx      # User profile
│   │   └── search.tsx       # Dedicated search screen
│   ├── collections/         # Collections management
│   ├── item/[id].tsx        # Post detail view
│   ├── settings/            # App settings
│   ├── share.tsx            # Share handler (auto-save)
│   └── tags/                # Tag management
├── components/              # Reusable UI components
│   ├── home/                # Home screen components
│   ├── navigation/          # Navigation components
│   ├── player/              # Video/content players
│   └── ui/                  # Design system atoms
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and services
│   ├── api.ts               # Supabase API calls
│   ├── supabase.ts          # Supabase client
│   ├── deeplinks.ts         # Deep linking logic
│   └── analytics.ts         # Event tracking
├── ios/                     # Native iOS code
│   └── ShareExtension/      # iOS Share Extension
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── unfurl/          # Metadata extraction
│   │   └── classify/        # AI tagging
│   └── schema.sql           # Database schema
└── tests/                   # Test suites
```

---

## 🎯 Core Features Breakdown

### Share Extension
Native iOS Share Extension that appears in the system share sheet. Captures URLs from any app and passes them to Nestly via deep linking.

**Implementation:**
- `ios/ShareExtension/ShareViewController.swift` - Native Swift code
- `app/share.tsx` - Auto-save screen with platform detection
- `hooks/useShareHandler.ts` - Deep link interception

### Metadata Extraction
Server-side unfurling of shared URLs to extract rich metadata.

**Flow:**
1. URL shared to Nestly
2. `unfurl` Edge Function fetches Open Graph/oEmbed data
3. Extracts: title, caption, author, thumbnail, platform
4. Stores in PostgreSQL with user association
5. Triggers `classify` function for auto-tagging

### Auto-Tagging
Intelligent categorization using AI or rule-based logic.

**Tags:**
Food, Travel, Tech, Fitness, Home, Style, Finance, Learning, Events, DIY, Beauty, Health, Parenting, Pets, Other

**Implementation:**
- AI: OpenAI GPT-4 zero-shot classification
- Rules: Pattern matching on title/caption keywords
- Fallback: Rules used if OpenAI unavailable

### Search & Filtering
Multi-dimensional search and filtering system.

**Capabilities:**
- Full-text search (PostgreSQL GIN index)
- Tag filtering (multi-select)
- Platform filtering (Instagram/TikTok/YouTube/Other)
- Date range filtering
- Sort by: Recent, Oldest

**UI:**
- Docked search rail (appears on scroll)
- Persists when filtering active
- Debounced input (250ms)
- Instant filter chips

---

## 🏗 Architecture Highlights

### Performance Optimizations
- **Virtualized lists** with `FlatList` for infinite scroll
- **Lazy image loading** with `expo-image`
- **Debounced search** to reduce API calls
- **Request animation frame** for smooth scrolling
- **Memoized components** to prevent re-renders

### State Management
- **React Context** for global state (auth, dock state)
- **Custom hooks** for data fetching (`usePosts`, `useSession`)
- **Optimistic updates** for instant UI feedback
- **Local storage** (AsyncStorage) for preferences

### Security
- **Row Level Security** (RLS) in Supabase
- **Parameterized queries** to prevent SQL injection
- **JWT authentication** with Supabase Auth
- **Secure storage** for sensitive data

### Offline Support
- **Cached images** with `expo-image`
- **Local preferences** with AsyncStorage
- **Optimistic UI** for immediate feedback
- **Retry logic** for failed requests

---

## 🧪 Testing

```bash
# Run test suites
node --loader ts-node/esm tests/rules.test.ts
node --loader ts-node/esm tests/canonicalize.test.ts
node --loader ts-node/esm tests/deeplinks.parseIncomingShare.test.ts

# Lint
npm run lint
```

---

## 🎨 Design System

### Typography
- **Font:** Sora (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700
- **Scale:** 28px (heading), 16px (body), 13px (small)

### Colors
- **Dark theme** primary with glass morphism
- **Accent:** Purple (#7A5CFF) and Cyan (#5CE1E6)
- **Glass effects** for elevated surfaces
- **Gradient overlays** for depth

### Components
All components follow a consistent design language:
- `Button` - Primary CTA with loading states
- `Chip` - Filter pills with haptic feedback
- `Glass` - Glassmorphic container
- `IconButton` - Circular icon buttons
- `SearchBar` - Debounced input with clear button

---

## 📚 Documentation

- **[DOCS.md](./DOCS.md)** - Comprehensive app guide
- **[STATUS.md](./STATUS.md)** - Project status and roadmap
- **[QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md)** - Testing instructions

---

## 🚧 Roadmap

### Planned Features
- [ ] **Android support** - Share Extension for Android
- [ ] **Light mode** - Complete light theme
- [ ] **Export** - Export data as JSON/CSV
- [ ] **Vector search** - Semantic search with pgvector
- [ ] **Push notifications** - Reminders for saved content
- [ ] **Tag aliases** - Flexible tag naming
- [ ] **Collaborative collections** - Share collections with others

### In Progress
- [x] ~~Cross-app sharing~~ ✅
- [x] ~~Collections~~ ✅
- [x] ~~Tag management~~ ✅
- [x] ~~Platform filtering~~ ✅

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Expo** for the incredible mobile development framework
- **Supabase** for backend infrastructure
- **React Native community** for amazing libraries
- **OpenAI** for AI-powered classification

---

## 📞 Contact

- **GitHub:** [@uwaisishaq](https://github.com/Uwais12)
- **Project Link:** [https://github.com/uwaisishaq/nestly](https://github.com/Uwais12/nestly)

---

<p align="center">Made with ❤️ for content collectors everywhere</p>
