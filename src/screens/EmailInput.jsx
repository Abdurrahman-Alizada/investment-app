// screens/EnterEmailScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import {Colours, height} from '../../constants/Details';
import Header from '../components/Header';
import CustomHeaderText from '../components/CustomHeaderText';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import {Colors} from '../../constants/Colors';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig';

const EnterEmailScreen = ({route, navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const {phone, country} = route.params; // Phone number from previous screen
  const [email, setEmail] = useState('');

  console.log('phone,country', phone, country);

  const handleNext = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    navigation.navigate('EnterName', {phone, email, country});
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
          padding: 20,
        }}>
        <CustomHeaderText title="Whats your email address?" />
        <Text
          style={{
            color: 'gray',
            marginBottom: 20,
          }}>
          Please enter your email to continue. After entering it, you can move
          forward to the next step.
        </Text>
        <CustomInput
          // style={styles.input}
          placeholder="example@gmail.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View
          style={{
            width: '100%',
            marginVertical: 20,
          }}>
          <CustomButton title="Next" onPress={handleNext} />
        </View>
      </View>
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

export default EnterEmailScreen;
