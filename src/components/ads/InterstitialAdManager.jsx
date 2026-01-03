import {useEffect, useState, useRef} from 'react';
import {Platform, StatusBar} from 'react-native';
import {InterstitialAd, AdEventType} from 'react-native-google-mobile-ads';
import {
  interstitialAdId,
  getAdRequestConfig,
  AD_CONFIG,
  AD_PERFORMANCE,
  shouldUseProgressiveLoading,
} from '../../ads/adsConfig';

class InterstitialAdManager {
  constructor() {
    this.ad = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.retryCount = 0;
    this.listeners = [];
    this.sessionCount = 0;
    this.lastShownTime = 0;
    this.keepAliveInterval = null;
    
    this.init();
    this.startKeepAlive();
  }

  init() {
    this.ad = InterstitialAd.createForAdRequest(
      interstitialAdId,
      getAdRequestConfig()
    );

    this.setupEventListeners();
    
    // Load immediately for better performance
    this.load();
  }

  setupEventListeners() {
    if (!this.ad) return;

    this.ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial ad loaded successfully');
      this.isLoaded = true;
      this.isLoading = false;
      this.retryCount = 0;
      AD_PERFORMANCE.recordSuccess();
      this.notifyListeners('loaded');
    });

    this.ad.addAdEventListener(AdEventType.ERROR, error => {
      console.log('❌ Interstitial ad failed to load:', error);
      this.isLoaded = false;
      this.isLoading = false;
      AD_PERFORMANCE.recordFailure(error);
      
      // Auto-retry logic
      if (this.retryCount < AD_CONFIG.maxRetries) {
        setTimeout(() => {
          console.log(`🔄 Retrying interstitial ad load (attempt ${this.retryCount + 1}/${AD_CONFIG.maxRetries})`);
          this.retryCount++;
          this.load();
        }, AD_CONFIG.retryDelay / 2); // Faster retry for interstitials
      }
      
      this.notifyListeners('failed', error);
    });

    this.ad.addAdEventListener(AdEventType.OPENED, () => {
      console.log('📺 Interstitial ad opened');
      if (Platform.OS === 'ios') {
        StatusBar.setHidden(true);
      }
      this.lastShownTime = Date.now();
      this.notifyListeners('opened');
    });

    this.ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('❌ Interstitial ad closed');
      if (Platform.OS === 'ios') {
        StatusBar.setHidden(false);
      }
      this.isLoaded = false;
      this.sessionCount++;
      
      // Preload next ad immediately
      setTimeout(() => this.load(), 100);
      
      this.notifyListeners('closed');
    });
  }

  load() {
    if (this.isLoading || this.isLoaded) return;
    
    console.log('🔄 Loading interstitial ad...');
    this.isLoading = true;
    AD_PERFORMANCE.recordAttempt();
    
    try {
      this.ad?.load();
    } catch (error) {
      console.log('❌ Error loading interstitial ad:', error);
      this.isLoading = false;
      // Retry immediately on error
      setTimeout(() => this.load(), 500);
    }
  }

  // Force reload if ad is taking too long
  forceReload() {
    if (this.isLoaded) return;
    
    console.log('🚀 Force reloading interstitial ad...');
    this.isLoading = false;
    this.load();
  }

  show() {
    if (!this.isLoaded) {
      console.log('⚠️ Interstitial ad not loaded yet');
      
      // Load ad if not already loading
      if (!this.isLoading) {
        this.load();
      }
      
      return false;
    }

    // Check frequency limits (don't show too often)
    const timeSinceLastShown = Date.now() - this.lastShownTime;
    const minInterval = 60000; // 1 minute minimum between ads
    
    if (timeSinceLastShown < minInterval) {
      console.log('⚠️ Interstitial ad shown too recently, skipping');
      return false;
    }

    try {
      this.ad?.show();
      return true;
    } catch (error) {
      console.log('❌ Error showing interstitial ad:', error);
      return false;
    }
  }

  // Smart showing based on user interactions
  showAfterUserAction(actionType) {
    const shouldShow = this.shouldShowForAction(actionType);
    
    if (shouldShow) {
      return this.show();
    }
    
    return false;
  }

  shouldShowForAction(actionType) {
    // Define when to show ads based on user actions
    const adTriggers = {
      'investment_complete': this.sessionCount >= 2,
      'portfolio_view': this.sessionCount >= 3,
      'navigation': this.sessionCount >= 5,
      'app_background': false, // Don't show when app goes to background
    };

    return adTriggers[actionType] || false;
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.log('Error in ad event listener:', error);
      }
    });
  }

  getStats() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      sessionCount: this.sessionCount,
      retryCount: this.retryCount,
      performance: AD_PERFORMANCE.getStats(),
    };
  }

  startKeepAlive() {
    // Check every 30 seconds if ad is loaded, if not try to reload
    this.keepAliveInterval = setInterval(() => {
      if (!this.isLoaded && !this.isLoading) {
        console.log('🔄 Keep-alive: Reloading interstitial ad...');
        this.load();
      }
    }, 30000); // 30 seconds
  }

  destroy() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    this.listeners = [];
    this.ad = null;
  }
}

// Singleton instance
const interstitialManager = new InterstitialAdManager();

// React hook for using the interstitial ad manager
export const useInterstitialAd = () => {
  const [isLoaded, setIsLoaded] = useState(interstitialManager.isLoaded);
  const [isLoading, setIsLoading] = useState(interstitialManager.isLoading);

  useEffect(() => {
    const removeListener = interstitialManager.addListener((event, data) => {
      switch (event) {
        case 'loaded':
          setIsLoaded(true);
          setIsLoading(false);
          break;
        case 'failed':
          setIsLoaded(false);
          setIsLoading(false);
          break;
        case 'closed':
          setIsLoaded(false);
          break;
      }
    });

    // Initial state sync
    setIsLoaded(interstitialManager.isLoaded);
    setIsLoading(interstitialManager.isLoading);

    return removeListener;
  }, []);

  return {
    isLoaded,
    isLoading,
    show: interstitialManager.show.bind(interstitialManager),
    showAfterUserAction: interstitialManager.showAfterUserAction.bind(interstitialManager),
    load: interstitialManager.load.bind(interstitialManager),
    getStats: interstitialManager.getStats.bind(interstitialManager),
  };
};

export default interstitialManager;