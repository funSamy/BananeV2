# Gestion Banane - Frontend

A modern Progressive Web App (PWA) for banana production management, built with React, TypeScript, and Vite.

## ✨ Features

- 📊 **Dashboard** - Production analytics and metrics
- 📝 **Data Management** - Add and edit production data
- 📈 **Charts & Visualizations** - Track production, sales, and expenditures
- 🌍 **Multilingual** - French and English support
- 📱 **Progressive Web App** - Install on any device, works offline
- 🎨 **Theme Support** - Light and dark mode
- 🔄 **Auto-Updates** - Seamless app updates

## 🚀 Progressive Web App (PWA)

This app can be **installed on your device** like a native app!

### Benefits

- ✅ Works offline
- ✅ Faster loading
- ✅ Push notifications (coming soon)
- ✅ Native app experience
- ✅ Auto-updates

### Installation

See **[QUICK_START.md](./QUICK_START.md)** for quick installation instructions or **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** for detailed platform-specific guides.

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Yarn package manager

### Setup

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build:production

# Preview production build
yarn preview
```

### Available Scripts

- `yarn dev` - Start development server (<http://localhost:3000>)
- `yarn build:development` - Build for development
- `yarn build:production` - Build for production with minification
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## 📚 Documentation

- **[LOCALIZATION.md](./LOCALIZATION.md)** - Internationalization guide
- **[LOCALIZATION_SUMMARY.md](./LOCALIZATION_SUMMARY.md)** - i18n implementation details
- **[PWA_GUIDE.md](./PWA_GUIDE.md)** - PWA technical documentation
- **[PWA_IMPLEMENTATION_SUMMARY.md](./PWA_IMPLEMENTATION_SUMMARY.md)** - PWA setup details
- **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - User installation instructions
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference for users

## 🏗️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **i18next** - Internationalization
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Workbox** - Service worker and PWA

## 🌐 Internationalization

The app supports **French (default)** and **English**. Users can switch languages using the language selector in the sidebar.

Translation files: `src/i18n/locales/`

## 📱 PWA Configuration

The app uses `vite-plugin-pwa` with Workbox for service worker generation:

- **Automatic updates** - Detects and installs updates automatically
- **Offline support** - Caches assets and API responses
- **Install prompts** - Custom install and update notifications
- **Manifest** - Auto-generated from Vite config

Configuration: `vite.config.ts`

## 🧪 Testing PWA

```bash
# Build and preview
yarn build:production
yarn preview

# Run Lighthouse audit in Chrome DevTools
# Go to Lighthouse tab → Select "Progressive Web App" → Generate report
```

Expected Lighthouse PWA score: **100/100** ✅

## 📂 Project Structure

```
src/
├── components/      # React components
│   ├── auth/       # Authentication components
│   ├── charts/     # Chart components
│   ├── forms/      # Form components
│   ├── pwa/        # PWA-specific components
│   ├── sidebar/    # Sidebar navigation
│   ├── theme/      # Theme and language switchers
│   └── ui/         # Reusable UI components
├── hooks/          # Custom React hooks
├── i18n/           # Internationalization
│   ├── config.ts   # i18n setup
│   └── locales/    # Translation files
├── layout/         # Layout components
├── lib/            # Utilities and helpers
├── pages/          # Page components
├── providers/      # Context providers
├── types/          # TypeScript types
├── App.tsx         # Root component
└── main.tsx        # App entry point
```

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000
```

## 🌟 Browser Support

- **Chrome** 90+ ✅
- **Edge** 90+ ✅
- **Firefox** 88+ ✅
- **Safari** 15.4+ ✅
- **Opera** 76+ ✅

## 📄 License

This project is proprietary software.

---

**Built with ❤️ for efficient banana production management** 🍌
