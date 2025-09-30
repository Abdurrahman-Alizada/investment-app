import React, {useEffect, useState} from 'react';
import {
  View,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {auth, db} from '../utils/firebase';
import {onAuthStateChanged} from 'firebase/auth';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import OneSignal from 'react-native-onesignal';
import FastImage from 'react-native-fast-image';

const SplashScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for OTP verification tag first
        // Wait for Firebase Auth state to initialize
        const unsubscribe = onAuthStateChanged(auth, async user => {
          if (user) {
            console.log(
              'User found:',
              user.email,
              'Verified:',
              user.emailVerified,
            );

            const otpVerified = user.emailVerified;
            const currentUserId = user.uid;
            console.log('Current user ID:', currentUserId);

            // OneSignal device state check
            const state = await OneSignal.getDeviceState();
            if (state?.userId) {
              console.log('OneSignal user ID:', state.userId);
              try {
                const userDocRef = doc(db, 'users', currentUserId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  await updateDoc(userDocRef, {
                    playerId: state.userId,
                  });
                }
              } catch (error) {
                console.error('Error updating playerId:', error);
              }
            }

            // Check user data
            const userDocRef = doc(db, 'users', currentUserId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const answeredQuestion = userDoc.data().answeredQuestions;

              if (answeredQuestion === true) {
                // navigation.replace("Tabs");
                navigation.replace('Drawer');
              } else {
                navigation.replace('Questions');
              }
            } else {
              navigation.replace('Questions');
            }
          } else {
            navigation.replace('Onboarding');
          }

          setIsLoading(false);
          unsubscribe();
        });
      } catch (error) {
        console.error('Error initializing app:', error);
        navigation.replace('Onboarding');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [navigation]);

  // useEffect(()=>{
  //   navigation.push('EnterAmount')
  // })

  return (
    <SafeAreaView
      testID="splashScreen"
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <Image
        testID="splashLogo"
        source={require('../../assets/playstore.png')}
        resizeMode="center"
        width={50}
      />

      <ActivityIndicator testID="loadingSpinner" size="large" color="black" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gif: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
