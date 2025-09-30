import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

const adUnitId =
  Platform.OS === 'ios'
    ? 'ca-app-pub-8600732172789254/8937579337'
    : 'ca-app-pub-8600732172789254/2306622188';

const adUnitId2 = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

const adUnitId3 = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

const interstitial = InterstitialAd.createForAdRequest(adUnitId2, {
  keywords: ['fashion', 'clothing'],
});

const rewarded = RewardedAd.createForAdRequest(adUnitId3, {
  keywords: ['fashion', 'clothing'],
});

const AdTest = () => {
  const [loaded, setLoaded] = useState(false);
  const [loaded2, setLoaded2] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true); // Set the ad as loaded
      },
    );

    const unsubscribeOpened = interstitial.addAdEventListener(
      AdEventType.OPENED,
      () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(true); // Hide the status bar on iOS
        }
      },
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false); // Show the status bar on iOS
        }
        interstitial.load(); // Reload the ad after it is closed
        setLoaded(false); // Reset the loaded state until the new ad is loaded
      },
    );

    // Load the interstitial ad initially
    interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded2(true);
      },
    );
    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward of ', reward);
      },
    );

    // Start loading the rewarded ad straight away
    rewarded.load();

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false); // Show the status bar on iOS
        }
        interstitial.load(); // Reload the ad after it is closed
        setLoaded(false); // Reset the loaded state until the new ad is loaded
      },
    );

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const handleShowAd = () => {
    if (loaded) {
      interstitial.show(); // Show the ad if it is loaded
    } else {
      Alert.alert(
        'Ad not loaded',
        'Please wait for the ad to load before trying again.',
      );
    }
  };

  if (!loaded2) {
    return null;
  }
  if (!loaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
      }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Pressable
        onPress={handleShowAd}
        style={{backgroundColor: 'blue', padding: 10, borderRadius: 5}}>
        <Text style={{color: 'white', fontSize: 16}}>Show Interstitial Ad</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          if (loaded2) {
            rewarded.show();
          } else {
            console.log('Rewarded ad not loaded yet');
          }
        }}
        style={{backgroundColor: 'blue', padding: 10, borderRadius: 5}}>
        <Text style={{color: 'white', fontSize: 16}}>Show Rewarded Ad</Text>
      </Pressable>
    </View>
  );
};

export default AdTest;

const styles = StyleSheet.create({});
