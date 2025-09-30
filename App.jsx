import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {React, useEffect} from 'react';
import {Text, Linking} from 'react-native';
import Toast from './src/components/ToastForBoth.jsx';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RootNavigator from './src/navigator/RootNavigator.jsx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CurrencyProvider from './contexts/CurrencyContext.js';
import OneSignal from 'react-native-onesignal';
import {updateDoc, doc} from 'firebase/firestore';
import {auth} from './src/utils/firebase.js';
import {startInterstitialTimer} from './src/ads/InterstitialManager.ts';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Platform} from 'react-native';

const Stack = createNativeStackNavigator();

const App = () => {
  // const checkNotificationPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     const androidVersion = parseInt(Platform.Version, 10);

  //     if (androidVersion >= 33) {
  //       const permission = PERMISSIONS.ANDROID.POST_NOTIFICATIONS;

  //       const result = await check(permission);

  //       if (result === RESULTS.GRANTED) {
  //         console.log("✅ Notification permission already granted");
  //       } else if (result === RESULTS.DENIED) {
  //         const requestResult = await request(permission);
  //         console.log("🔔 User response:", requestResult);
  //       } else if (result === RESULTS.BLOCKED) {
  //         console.log("🚫 Permission blocked. Ask user to enable from settings.");
  //       } else {
  //         console.log("❓ Unknown status:", result);
  //       }
  //     } else {
  //       console.log("🔔 Notification permission not required for Android < 13");
  //     }
  //   }
  // };

  useEffect(() => {
    // checkNotificationPermission()

    const clear = startInterstitialTimer();
    return () => clear(); // clean up
  }, []);

  useEffect(() => {
    OneSignal.setAppId('55a51ffb-efab-4fd3-8156-acc72a029ea3');

    OneSignal.promptForPushNotificationsWithUserResponse(response => {});

    // Set up event handlers using the new API:
    OneSignal.setNotificationOpenedHandler(notification => {
      console.log('Notification opened:', notification);
    });

    OneSignal.setNotificationWillShowInForegroundHandler(
      notificationReceivedEvent => {
        console.log(
          'Notification received in foreground:',
          notificationReceivedEvent,
        );
        const notification = notificationReceivedEvent.getNotification();
        notificationReceivedEvent.complete(notification);
      },
    );
  }, []);
  const onReceived = notification => {
    console.log('Notification received: ', notification);
  };

  const onOpened = openResult => {
    console.log('Notification opened: ', openResult);
  };

  const onIds = device => {
    console.log('Device info: ', device);
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <CurrencyProvider>
          <NavigationContainer>
            <Toast />
            <RootNavigator />
          </NavigationContainer>
        </CurrencyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
