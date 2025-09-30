// screens/EnterPasswordScreen.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import {auth, db} from '../utils/firebase'; // Adjust the path to your firebase.js file
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  doc,
  serverTimestamp,
  setDoc,
  increment,
  getDoc,
} from 'firebase/firestore';
import {Colours, height} from '../../constants/Details';
import Header from '../components/Header';
import CustomHeaderText from '../components/CustomHeaderText';
import PasswordInput from '../components/PasswordInput';
import CustomButton from '../components/CustomButtom';
import toast from '../../helpers/toast';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig';

const EnterPasswordScreen = ({route, navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const {phone, email, country, name} = route.params; // Phone and email from previous screens
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  console.log('phone,email,country', phone, email, country);

  const handleCreateAccount = async () => {
    if (!password || password.length < 6) {
      console.log('Password validation failed');
      toast.info({message: 'Password must be at least 6 characters long.'});
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting to create user with email:', email);

      // Step 1: Create user account with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log('User created successfully:', userCredential);

      console.log('Signing in user with email:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');

      // Generate custom ID and referral code
      console.log('Generating custom ID...');
      const customID = await generateUserId();
      console.log('Generated custom ID:', customID);

      console.log('Generating referral code...');
      const referralCode = generateReferralCode(customID);
      console.log('Generated referral code:', referralCode);

      await AsyncStorage.setItem('isLoggedIn', 'true');
      console.log('Stored login state in AsyncStorage');

      // Step 2: Get the user object from the userCredential
      const user = userCredential.user;
      console.log('Firebase UID:', user.uid);

      const userData = {
        email: email,
        phoneNumber: phone, // Assuming `phone` is available
        country: country, // Assuming `country` is available
        signupDate: serverTimestamp(),
        lastLoginDate: null,
        loginStreak: 0,
        claimedRewards: [],
        customID: customID,
        referralCode: referralCode,
        name: name,
      };

      console.log('User data to save:', userData);

      // Firebase document creation (Check customID usage)
      console.log('Saving user data to Firestore...');
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User data saved successfully in Firestore');

      // Step 3: Send verification email
      // console.log('Sending email verification...');
      // await sendEmailVerification(user);
      // console.log('Email verification sent');

      // Step 4: Navigate to the "Enter Referral" screen
      console.log('Navigating to EnterReferral screen');
      setIsLoading(false);
      await AsyncStorage.setItem('isLoggedIn', 'true').then(() => {
        navigation.navigate('Login', {});
      });
    } catch (error) {
      console.error('Firebase error:', error);

      let errorMessage = 'Failed to create account. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'The email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is invalid.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak.';
          break;
        default:
          console.error('Unhandled Firebase error:', error);
      }
      setIsLoading(false);
      toast.info({message: errorMessage});
    }
  };

  const generateUserId = async () => {
    try {
      console.log('Starting to generate UserID...');

      // Reference to the Firestore counter document
      const counterRef = doc(db, 'counters', 'userCount');
      console.log('Counter reference created:', counterRef.path);

      // Increment the counter in Firestore
      console.log('Incrementing the user count...');
      await setDoc(counterRef, {count: increment(1)}, {merge: true});
      console.log('User count incremented successfully.');

      // Fetch the updated counter value
      console.log('Fetching the updated counter value...');
      const counterDoc = await getDoc(counterRef);

      if (!counterDoc.exists()) {
        console.error('Counter document does not exist in Firestore.');
        return null;
      }

      const count = counterDoc.data().count;
      console.log('Fetched counter value:', count);

      // Generate the unique UserID
      const userId = `HU${String(count).padStart(4, '0')}`; // HU0001, HU0002, ..., HU10000
      console.log('Generated UserID:', userId);

      return userId;
    } catch (error) {
      console.error('Error generating UserID:', error);
      return null;
    }
  };

  const generateReferralCode = userId => {
    const randomAlphabets = Array.from(
      {length: 3},
      () => String.fromCharCode(65 + Math.floor(Math.random() * 26)), // A-Z
    ).join('');
    return `${userId}${randomAlphabets}`; // HU0001FLK
  };

  return (
    <SafeAreaView style={styles.container}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />
      <View
        style={{
          width: '100%',
          height: height * 0.91,
          padding: 12,
        }}>
        <CustomHeaderText title="Choose a password" />
        <Text
          style={{
            color: 'gray',
            marginBottom: 20,
          }}>
          To complete the creation of your account, please ensure you create a
          strong password that you can remember.
        </Text>
        {/* <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      /> */}

        <PasswordInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
        />

        <View
          style={{
            marginVertical: 30,
            width: '100%',
          }}>
          <CustomButton title="Create Account" onPress={handleCreateAccount} />
        </View>
      </View>
      {isLoading && <LoaderAnim />}
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      // padding: 20,
      backgroundColor: Colors[theme].background,
    },
    title: {
      fontSize: 20,
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      padding: 10,
      marginVertical: 10,
      borderRadius: 5,
      borderColor: '#ccc',
    },
  });

export default EnterPasswordScreen;
