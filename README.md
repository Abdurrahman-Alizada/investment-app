
# HunaInvest
<img width="1080" height="2400" alt="Screenshot_1767428299" src="https://github.com/user-attachments/assets/f1a07dac-9996-477c-83c1-d8d15c32ee5c" />
<img width="1080" height="2400" alt="Screenshot_1767428357" src="https://github.com/user-attachments/assets/e51d299b-1e45-4424-a619-442134597a97" />
<img width="1080" height="2400" alt="Screenshot_1767428335" src="https://github.com/user-attachments/assets/03b02240-4fde-48dd-9b82-17fc3f03e7bd" />
<img width="1080" height="2400" alt="Screenshot_1767428326" src="https://github.com/user-attachments/assets/62afa30c-3020-49b5-aa02-0bca6370f599" />
<img width="1080" height="2400" alt="Screenshot_1767428321" src="https://github.com/user-attachments/assets/3c8c748a-9e08-42e9-a31e-2b5782d14743" />
<img width="1080" height="2400" alt="Screenshot_1767428316" src="https://github.com/user-attachments/assets/25128d8f-f4d0-4fa2-b459-7abb36f638cf" />
<img width="1080" height="2400" alt="Screenshot_1767428310" src="https://github.com/user-attachments/assets/7f3b228e-6b81-4feb-994a-de4f64c14ffb" />

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
