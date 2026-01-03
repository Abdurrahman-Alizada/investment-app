# HunaInvest

A mobile investment simulation app built with React Native. Practice investing in Solar Power, Real Estate, Gold, and Stocks in a risk-free environment.

## Features

- Multiple investment options (Solar, Apartments, Gold, Stocks)
- Portfolio tracking with charts and analytics
- Multi-currency support
- Referral rewards system
- Daily login rewards
- Real-time investment tracking
- Dark mode support

## Tech Stack

- React Native 0.76.7
- Firebase (Auth & Firestore)
- React Navigation
- Google Mobile Ads
- OneSignal (Push Notifications)

## Getting Started

### Prerequisites

- Node.js (>= 18)
- React Native development environment
- Firebase account
- AdMob account (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd HunaInvest-main

# Install dependencies
npm install

# iOS only
cd ios && pod install && cd ..
```

### Configuration

1. Create a Firebase project and add your configuration files
2. Set up Firebase Authentication and Firestore
3. (Optional) Configure Google AdMob for monetization
4. (Optional) Set up OneSignal for push notifications

### Run the App

```bash
# Start Metro
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```text
src/
├── screens/        # App screens
├── components/     # Reusable components
├── navigator/      # Navigation setup
├── utils/          # Helper functions
└── ads/           # Ad configuration
```

## Investment Types

- **Solar Power** - Clean energy investments
- **Apartments** - Real estate opportunities
- **Gold** - Precious metals trading
- **Stocks** - Stock market simulation

## License

MIT License

---

Built with React Native
