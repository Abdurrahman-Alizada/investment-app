import {Platform} from 'react-native';
import {TestIds} from 'react-native-google-mobile-ads';

// Enhanced dev mode detection - checks both __DEV__ and debug mode
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
const FORCE_TEST_ADS = false; // Set to true to test ad implementation

// Ad configuration with retry settings
export const AD_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second for faster retry
  testMode: isDevelopment || FORCE_TEST_ADS,
  progressiveLoading: false, // Load ads immediately for better performance
  fillRateTracking: true,
};

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

// Investment-focused keywords for better targeting
export const AD_KEYWORDS = [
  'investment',
  'finance',
  'money',
  'portfolio',
  'trading',
  'stocks',
  'gold',
  'solar',
  'real estate',
  'wealth',
  'savings',
  'financial planning',
  'cryptocurrency',
  'mutual funds',
];

// Enhanced ad ID getter with fallback logic
const getAdId = adType => {
  if (AD_CONFIG.testMode) {
    console.log(`🧪 Using test ad ID for ${adType}`);
    return testIds[adType];
  }

  console.log(`📱 Using production ad ID for ${adType}`);
  return realIds[adType];
};

// Ad request configuration
export const getAdRequestConfig = () => ({
  keywords: AD_KEYWORDS,
  requestNonPersonalizedAdsOnly: false,
  contentUrl: 'https://hunainvest.com',
  neighboringContentUrls: [
    'https://hunainvest.com/investment',
    'https://hunainvest.com/portfolio',
  ],
});

export const bannerAdId = getAdId('banner');
export const interstitialAdId = getAdId('interstitial');
export const rewardedAdId = getAdId('rewarded');

// Helper functions
export const isAdTestMode = AD_CONFIG.testMode;
export const shouldUseProgressiveLoading = AD_CONFIG.progressiveLoading;

// Ad performance tracking
export const AD_PERFORMANCE = {
  attempts: 0,
  successes: 0,
  failures: 0,
  noFillErrors: 0,
  
  recordAttempt() {
    this.attempts++;
  },
  
  recordSuccess() {
    this.successes++;
  },
  
  recordFailure(error) {
    this.failures++;
    if (error?.message?.includes('no-fill')) {
      this.noFillErrors++;
    }
  },
  
  getFillRate() {
    return this.attempts > 0 ? (this.successes / this.attempts * 100).toFixed(2) : 0;
  },
  
  getStats() {
    return {
      attempts: this.attempts,
      successes: this.successes,
      failures: this.failures,
      noFillErrors: this.noFillErrors,
      fillRate: this.getFillRate() + '%',
    };
  },
};
