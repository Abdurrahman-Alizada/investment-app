import React, {useState, useEffect} from 'react';
import {
  Dimensions,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {auth} from '../utils/firebase'; // Import only `auth`
import Header from '../components/Header';
import {Colours} from '../../constants/Details';
import CustomHeaderText from '../components/CustomHeaderText';
import {OtpInput} from 'react-native-otp-entry';
import CustomButton from '../components/CustomButtom';
import toast from '../../helpers/toast';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';
import {useNavigation} from '@react-navigation/native';
import {sendEmailOtp} from '../utils/enterEmailOTP';

const {width, height} = Dimensions.get('window');

const OTPVerification = ({route}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const {phone, otp: initialOtp, country, isLogin, email} = route.params;
  const [inputOtp, setInputOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otp, setOtp] = useState(initialOtp);

  const navigation = useNavigation();

  // Timer effect for Resend OTP button
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (!inputOtp) {
      toast.danger({message: 'Please enter the OTP'});
      return;
    }

    if (inputOtp === otp) {
      setError('');

      if (isLogin) {
        setIsLoading(true);
        try {
          const user = auth.currentUser;
          if (user) {
            await user.reload();

            await AsyncStorage.setItem('isLoggedIn', 'true');
            navigation.replace('Splash');
          } else {
            toast.info({message: 'User not found. Please log in again.'});
          }
        } catch (error) {
          toast.info({message: 'An error occurred. Please try again.'});
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.info({message: 'OTP verification successful!'});
        navigation.navigate('EnterEmail', {phone, country});
      }
    } else {
      toast.info({message: 'Incorrect OTP. Please try again.'});
    }
  };

  const handleResendOTP = async () => {
    console.log('Resend OTP pressed');
    setIsResendDisabled(true);
    setTimer(120); // Reset the timer

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtp(newOtp);

    console.log('New OTP:', newOtp);

    try {
      await sendEmailOtp(email, newOtp);
      toast.info({message: `A new OTP has been sent to ${email}`});
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.info({message: 'Failed to resend OTP. Please try again.'});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.innerContainer}>
        <CustomHeaderText title="Email verification" />
        <Text style={styles.infoText}>
          We have sent the verification code to your email.
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OtpInput
            numberOfDigits={4}
            onTextChange={setInputOtp}
            focusColor={Colours.primaryColour}
            focusStickBlinkingDuration={400}
            theme={{
              pinCodeContainerStyle: {
                backgroundColor: Colors[theme].background,
                width: 58,
                height: 58,
                borderRadius: 12,
                borderWidth: 2,
              },
              pinCodeTextStyle: {
                color: Colors[theme].textColor, // <-- Change this to your desired color
                fontSize: 24,
                fontWeight: 'bold',
              },
            }}
          />
        </View>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.dontText}>Didn't receive the code?</Text>
          {isResendDisabled ? (
            <Text style={styles.timerText}>
              Resend in {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, '0')}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendTxt}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <CustomButton title="Verify" onPress={handleVerifyOTP} />
      </View>
      {isLoading && <LoaderAnim />}
    </SafeAreaView>
  );
};

export default OTPVerification;

const createStyles = theme => ({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background,
  },
  innerContainer: {
    width: '100%',
    padding: 20,
    height: height * 0.91,
  },
  infoText: {
    color: 'gray',
    marginBottom: 10,
  },
  otpContainer: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dontText: {
    color: 'gray',
    marginRight: 5,
  },
  timerText: {
    color: 'red',
    fontWeight: 'bold',
  },
  resendTxt: {
    color: Colours.primaryColour,
    fontWeight: 'bold',
  },
});
