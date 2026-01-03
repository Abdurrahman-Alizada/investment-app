import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {
  bannerAdId,
  getAdRequestConfig,
  AD_CONFIG,
  AD_PERFORMANCE,
  shouldUseProgressiveLoading,
} from '../../ads/adsConfig';
import AdFallback, {InvestmentTip, PromotionalContent} from './AdFallback';

const INVESTMENT_TIPS = [
  'Diversify your portfolio across different asset classes',
  'Start investing early to benefit from compound interest',
  'Review your investment goals regularly',
  'Consider dollar-cost averaging for consistent investing',
  'Never invest more than you can afford to lose',
  'Research before making any investment decisions',
];

const PROMOTIONAL_CONTENT = [
  {
    title: 'Portfolio Review',
    subtitle: 'Check your investment performance',
    action: 'portfolio',
    icon: 'chart-line',
  },
  {
    title: 'New Investment',
    subtitle: 'Explore solar and gold options',
    action: 'invest',
    icon: 'trending-up',
  },
  {
    title: 'Market Updates',
    subtitle: 'Stay informed about market trends',
    action: 'market',
    icon: 'newspaper',
  },
];

const EnhancedBannerAd = ({
  style,
  onAdLoaded,
  onAdFailedToLoad,
  onPress,
  navigation,
  showFallback = true,
  fallbackType = 'tip', // 'tip', 'promo', 'simple'
  delayLoad = false,
  delayTime = 2000,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!delayLoad);
  const [retryCount, setRetryCount] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [currentPromo, setCurrentPromo] = useState(0);
  const retryTimeoutRef = useRef(null);
  const tipRotationRef = useRef(null);

  useEffect(() => {
    if (delayLoad) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delayTime);
      return () => clearTimeout(timer);
    }
  }, [delayLoad, delayTime]);

  useEffect(() => {
    if (fallbackType === 'tip' && adFailed) {
      tipRotationRef.current = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % INVESTMENT_TIPS.length);
      }, 8000);
    }
    return () => {
      if (tipRotationRef.current) {
        clearInterval(tipRotationRef.current);
      }
    };
  }, [adFailed, fallbackType]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (tipRotationRef.current) {
        clearInterval(tipRotationRef.current);
      }
    };
  }, []);

  const handleAdLoaded = () => {
    console.log('✅ Banner ad loaded successfully');
    setAdLoaded(true);
    setAdFailed(false);
    setRetryCount(0);
    AD_PERFORMANCE.recordSuccess();
    onAdLoaded && onAdLoaded();
  };

  const handleAdFailedToLoad = error => {
    console.log('❌ Banner ad failed to load:', error);
    setAdLoaded(false);
    setAdFailed(true);
    AD_PERFORMANCE.recordFailure(error);
    
    // Auto-retry logic
    if (retryCount < AD_CONFIG.maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 Retrying ad load (attempt ${retryCount + 1}/${AD_CONFIG.maxRetries})`);
        setRetryCount(prev => prev + 1);
        setAdFailed(false);
        // Force re-render to trigger ad reload
        setShouldLoad(false);
        setTimeout(() => setShouldLoad(true), 50);
      }, AD_CONFIG.retryDelay);
    }

    onAdFailedToLoad && onAdFailedToLoad(error);
  };

  const handleManualRetry = () => {
    console.log('🔄 Manual retry triggered');
    setRetryCount(0);
    setAdFailed(false);
    setShouldLoad(false);
    setTimeout(() => setShouldLoad(true), 50);
  };

  const handleFallbackAction = action => {
    switch (action) {
      case 'portfolio':
        navigation?.navigate('Tabs', {screen: 'Portfolio'});
        break;
      case 'invest':
        navigation?.navigate('SolarPosters');
        break;
      case 'market':
        // Navigate to market updates or news section
        break;
      default:
        onPress && onPress();
    }
  };

  const renderFallback = () => {
    if (!showFallback) return null;

    switch (fallbackType) {
      case 'tip':
        return (
          <InvestmentTip
            tip={INVESTMENT_TIPS[currentTip]}
            onDismiss={() => setCurrentTip(prev => (prev + 1) % INVESTMENT_TIPS.length)}
          />
        );
      case 'promo':
        const promo = PROMOTIONAL_CONTENT[currentPromo];
        return (
          <PromotionalContent
            title={promo.title}
            subtitle={promo.subtitle}
            icon={promo.icon}
            onPress={() => handleFallbackAction(promo.action)}
          />
        );
      default:
        return (
          <AdFallback
            onRetry={handleManualRetry}
            showRetry={retryCount >= AD_CONFIG.maxRetries}
            type="banner"
          />
        );
    }
  };

  // Record ad attempt
  useEffect(() => {
    if (shouldLoad) {
      AD_PERFORMANCE.recordAttempt();
    }
  }, [shouldLoad]);

  if (!shouldLoad) {
    return null;
  }

  if (adFailed && retryCount >= AD_CONFIG.maxRetries) {
    return <View style={[styles.container, style]}>{renderFallback()}</View>;
  }

  return (
    <View style={[styles.container, style]}>
      {shouldLoad && (
        <BannerAd
          unitId={bannerAdId}
          sizes={[
            BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
            BannerAdSize.FULL_BANNER,
            BannerAdSize.BANNER,
          ]}
          requestOptions={getAdRequestConfig()}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
        />
      )}
      {adFailed && !adLoaded && renderFallback()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnhancedBannerAd;