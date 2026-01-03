import {useEffect, useState, useRef} from 'react';
import {Platform, StatusBar} from 'react-native';
import {RewardedAd, AdEventType, RewardedAdEventType} from 'react-native-google-mobile-ads';
import {
  rewardedAdId,
  getAdRequestConfig,
  AD_CONFIG,
  AD_PERFORMANCE,
} from '../../ads/adsConfig';

class RewardedAdManager {
  constructor() {
    this.ad = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.retryCount = 0;
    this.listeners = [];
    this.earnedReward = null;
    
    this.init();
  }

  init() {
    this.ad = RewardedAd.createForAdRequest(
      rewardedAdId,
      getAdRequestConfig()
    );

    this.setupEventListeners();
    this.load();
  }

  setupEventListeners() {
    if (!this.ad) return;

    this.ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('✅ Rewarded ad loaded successfully');
      this.isLoaded = true;
      this.isLoading = false;
      this.retryCount = 0;
      AD_PERFORMANCE.recordSuccess();
      this.notifyListeners('loaded');
    });

    this.ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log('🏆 User earned reward:', reward);
      this.earnedReward = reward;
      this.notifyListeners('rewarded', reward);
    });

    this.ad.addAdEventListener(AdEventType.ERROR, error => {
      console.log('❌ Rewarded ad failed to load:', error);
      this.isLoaded = false;
      this.isLoading = false;
      AD_PERFORMANCE.recordFailure(error);
      
      // Auto-retry logic with backoff for no-fill errors
      if (this.retryCount < AD_CONFIG.maxRetries) {
        const isNoFill = error?.message?.includes('no-fill');
        const retryDelay = isNoFill ? AD_CONFIG.retryDelay * 3 : AD_CONFIG.retryDelay; // Longer delay for no-fill
        
        setTimeout(() => {
          console.log(`🔄 Retrying rewarded ad load (attempt ${this.retryCount + 1}/${AD_CONFIG.maxRetries})`);
          this.retryCount++;
          this.load();
        }, retryDelay);
      } else if (error?.message?.includes('no-fill')) {
        console.log('ℹ️ Rewarded ads not available - this is normal in test mode or low inventory regions');
      }
      
      this.notifyListeners('failed', error);
    });

    this.ad.addAdEventListener(AdEventType.OPENED, () => {
      console.log('📺 Rewarded ad opened');
      if (Platform.OS === 'ios') {
        StatusBar.setHidden(true);
      }
      this.notifyListeners('opened');
    });

    this.ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('❌ Rewarded ad closed');
      if (Platform.OS === 'ios') {
        StatusBar.setHidden(false);
      }
      this.isLoaded = false;
      
      // Preload next ad
      setTimeout(() => this.load(), 1000);
      
      this.notifyListeners('closed', this.earnedReward);
      this.earnedReward = null;
    });
  }

  load() {
    if (this.isLoading || this.isLoaded) return;
    
    console.log('🔄 Loading rewarded ad...');
    this.isLoading = true;
    AD_PERFORMANCE.recordAttempt();
    
    try {
      this.ad?.load();
    } catch (error) {
      console.log('❌ Error loading rewarded ad:', error);
      this.isLoading = false;
    }
  }

  show() {
    if (!this.isLoaded) {
      console.log('⚠️ Rewarded ad not loaded yet');
      
      // Load ad if not already loading
      if (!this.isLoading) {
        this.load();
      }
      
      return false;
    }

    try {
      this.ad?.show();
      return true;
    } catch (error) {
      console.log('❌ Error showing rewarded ad:', error);
      return false;
    }
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
        console.log('Error in rewarded ad event listener:', error);
      }
    });
  }

  getStats() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      retryCount: this.retryCount,
      performance: AD_PERFORMANCE.getStats(),
    };
  }

  destroy() {
    this.listeners = [];
    this.ad = null;
  }
}

// Singleton instance
const rewardedAdManager = new RewardedAdManager();

// React hook for using the rewarded ad manager
export const useRewardedAd = () => {
  const [isLoaded, setIsLoaded] = useState(rewardedAdManager.isLoaded);
  const [isLoading, setIsLoading] = useState(rewardedAdManager.isLoading);

  useEffect(() => {
    const removeListener = rewardedAdManager.addListener((event, data) => {
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
    setIsLoaded(rewardedAdManager.isLoaded);
    setIsLoading(rewardedAdManager.isLoading);

    return removeListener;
  }, []);

  return {
    isLoaded,
    isLoading,
    show: rewardedAdManager.show.bind(rewardedAdManager),
    load: rewardedAdManager.load.bind(rewardedAdManager),
    getStats: rewardedAdManager.getStats.bind(rewardedAdManager),
  };
};

export default rewardedAdManager;