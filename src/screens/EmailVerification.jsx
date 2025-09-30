// screens/PendingVerificationScreen.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'; // Adjust the path to your firebase.js file
import {onAuthStateChanged, sendEmailVerification} from 'firebase/auth';
import {Colours, height} from '../../constants/Details';
import Header from '../components/Header';
import CustomHeaderText from '../components/CustomHeaderText';
import CustomButton from '../components/CustomButtom';
import {auth, db} from '../utils/firebase'; // Importing Firebase auth and Firestore
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import {reload} from 'firebase/auth';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';

// import { Image } from "react-native-svg";

const PendingVerificationScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const email = 'thishon233@gmail.com';

  // Function to check email verification status
  const checkEmailVerification = async () => {
    const user = auth.currentUser;

    if (user) {
      await reload(user); // Refresh authentication state

      if (user.emailVerified) {
        setIsEmailVerified(true);

        const userRef = doc(db, `users/${user.uid}`);
        await updateDoc(userRef, {
          emailVerified: true,
        });

        try {
          // Fetch answeredQuestion from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          console.log(
            'userDoc:',
            userDoc.exists() ? userDoc.data() : 'No document found',
          );

          if (userDoc.exists() && userDoc.data()?.answeredQuestion) {
            navigation.replace('Login'); // Navigate to home if questions are answered
          } else {
            navigation.replace('Login'); // Navigate to questions screen
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setIsEmailVerified(false);
      }
    } else {
      navigation.replace('Login'); // Redirect to login if user not found
    }

    setIsLoading(false);
  };

  useEffect(() => {
    console.log('auth.current', auth.currentUser);
    // Set up an authentication state listener
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        checkEmailVerification(); // Check email verification status
      } else {
        setIsLoading(false);
        navigation.replace('Login'); // Redirect to the login screen
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [navigation]);

  // Function to resend the verification email
  const handleResendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        alert('Verification email sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to resend verification email. Please try again.');
    }
  };

  // Function to manually refresh the email verification status
  const handleRefresh = async () => {
    setIsLoading(true);
    await checkEmailVerification();
  };

  // if (isLoading) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //       <Text>Checking email verification status...</Text>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View
        style={{
          width: '100%',
          padding: 20,
          backgroundColor: Colors[theme].background,
          height: height * 0.91,
        }}>
        {isEmailVerified ? (
          <>
            <Text style={styles.message}>Your email has been verified!</Text>
            <CustomButton
              title="Continue"
              onPress={() => navigation.push('Questions')}
            />
          </>
        ) : (
          <>
            <CustomHeaderText title="Please check your email inbox" />
            <Text style={styles.message}>
              Before your continue, verify the email
            </Text>

            <View
              style={{
                width: '100%',
                height: height * 0.45,
                marginVertical: 20,
              }}>
              <Image source={require('../../assets/email.png')} />
            </View>

            <CustomButton title="Verified" onPress={handleRefresh} />
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendVerificationEmail}>
              <Text style={styles.resendButtontext}>
                Resend verification email
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      {isLoading && <LoaderAnim />}
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    message: {
      fontSize: 16,
      marginBottom: 20,
      color: 'gray',
    },
    resendButton: {
      width: '100%',
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resendButtontext: {
      color: Colors[theme].textColor,
      marginVertical: 10,
      fontWeight: '600',
      fontSize: 15,
    },
  });

export default PendingVerificationScreen;
