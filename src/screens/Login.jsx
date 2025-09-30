import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {auth, db} from '../utils/firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import toast from '../../helpers/toast';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import CustomButton from '../components/CustomButtom';
import {Colours} from '../../constants/Details';
// Adjust the path to your OTP sending function
import sendOTP from '../utils/sendPhoneOTP';
import {Colors} from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoaderAnim from '../components/Loader';
import {sendEmailOtp} from '../utils/enterEmailOTP';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig';
import {SafeAreaView} from 'react-native-safe-area-context';

const LoginScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.info({message: 'Please enter both email and password.'});
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      if (email === 'thevanesi95@gmail.com') {
        navigation.replace('Drawer');

        return;
      }

      const userDocRef = doc(db, 'users', user.uid);

      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        const phoneNumber = userData.phoneNumber;

        if (phoneNumber) {
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          const response = await sendEmailOtp(email, otp);

          if (response && response.success) {
            setTimeout(() => {
              navigation.push('OTPVerification', {
                phoneNumber,
                otp,
                isLogin: true,
                email,
              });
              // navigation.replace('Splash');
            }, 500);
          } else {
            throw new Error('Failed to send OTP. Please try again.');
          }
        } else {
          toast.error({message: 'Phone number not found for this account.'});
        }
      } else {
        toast.error({message: 'User data not found.'});
      }
    } catch (error) {
      // console.error('Login error:', error.code);
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/invalid-email')
        errorMessage = 'Invalid email format.';
      else if (error.code === 'auth/user-not-found')
        errorMessage = 'User not found.';
      else if (error.code === 'auth/wrong-password')
        errorMessage = 'Incorrect password.';
      toast.info({message: errorMessage});
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors[theme].background}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <BannerAd
          unitId={bannerAdId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.logoContainer}>
            <Image
              source={require('../../assets/playstore.png')}
              style={styles.logo}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400)}
            style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(600)}
            style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Icon
                name="email-outline"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors[theme].textColor}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon
                name="lock-outline"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors[theme].textColor}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgetPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              testID="loginButton"
              title="Login"
              onPress={handleLogin}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('CountrySelection')}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Text style={styles.signupTextBold}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
        {loading && <LoaderAnim />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: Colors[theme].background,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    headerContainer: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[theme].textColor,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: Colors[theme].textColor,
      textAlign: 'center',
      marginTop: 8,
    },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[theme].inputBackground,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: '#e1e1e1',
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: Colors[theme].textColor,
    },
    eyeIcon: {
      padding: 4,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    forgotPasswordText: {
      color: Colours.primaryColour,
      fontSize: 14,
      fontWeight: '600',
    },
    buttonContainer: {
      marginBottom: 24,
    },
    button: {
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#e1e1e1',
    },
    dividerText: {
      color: '#666',
      paddingHorizontal: 16,
      fontSize: 14,
    },
    signupButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signupText: {
      color: Colors[theme].textColor,
      fontSize: 16,
    },
    signupTextBold: {
      color: Colours.primaryColour,
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default LoginScreen;
