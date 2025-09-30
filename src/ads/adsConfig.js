import {Platform} from 'react-native';
import {TestIds} from 'react-native-google-mobile-ads';

// Better to use environment variables
const __DEV_MODE__ = false; // Keep true until ads work consistently

const testIds = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
};

const realIds = {
  banner:
    Platform.OS === 'ios'
      ? 'ca-app-pub-8600732172789254/8760609960'
      : 'ca-app-pub-8600732172789254/9507293071',

  interstitial:
    Platform.OS === 'ios'
      ? 'ca-app-pub-8600732172789254/4769394060'
      : 'ca-app-pub-8600732172789254/8018789880',

  rewarded:
    Platform.OS === 'ios'
      ? 'ca-app-pub-8600732172789254/3456312394'
      : 'ca-app-pub-8600732172789254/6509658286',
};

// Function to get ad ID with fallback
const getAdId = adType => {
  if (__DEV_MODE__) {
    return testIds[adType];
  }

  // In production, but if real ads fail, fallback to test
  return realIds[adType];
};

export const bannerAdId = getAdId('banner');
export const interstitialAdId = getAdId('interstitial');
export const rewardedAdId = getAdId('rewarded');

// Helper to check if we're in development
export const isAdTestMode = __DEV_MODE__;
