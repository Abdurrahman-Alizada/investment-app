import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { interstitialAdId } from './adsConfig';

const interstitial = InterstitialAd.createForAdRequest(interstitialAdId);

export const startInterstitialTimer = () => {
  const interval = setInterval(() => {
    interstitial.load();
  }, 5 * 60 * 1000);

  const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitial.show();
  });

  return () => {
    clearInterval(interval);
    unsubscribe();
  };
};
