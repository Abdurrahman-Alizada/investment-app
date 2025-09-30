// screens/PhoneNumberScreen.js
import React, {useState, useEffect} from 'react';
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  TextInput,
} from 'react-native';
import sendOTP from '../utils/sendPhoneOTP';
import CustomInput from '../components/CustomInput';
import {Colours} from '../../constants/Details';
import Header from '../components/Header';
import CustomHeaderText from '../components/CustomHeaderText';
import toast from '../../helpers/toast';
import CustomButton from '../components/CustomButtom';
import {getDocs, collection, query, where} from 'firebase/firestore';
import {db} from '../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig';

const {width, height} = Dimensions.get('window');

// Hardcoded country list (you can expand)
const COUNTRIES = [
  {name: 'Sri Lanka', callingCode: '+94'},
  {name: 'India', callingCode: '+91'},
  {name: 'United States', callingCode: '+1'},
  {name: 'United Kingdom', callingCode: '+44'},
  {name: 'Canada', callingCode: '+1'},
  // Add more countries as needed
];

const PhoneNumberScreen = ({route, navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const {country: initialCountry} = route.params;
  const [country, setCountry] = useState(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [countries, setCountries] = useState();
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'https://restcountries.com/v2/all?fields=name,alpha2Code,callingCodes',
        );
        const data = await response.json();

        const formattedCountries = data
          .map(country => ({
            name: country.name,
            code: country.alpha2Code,
            callingCode: country.callingCodes?.[0]
              ? `+${country.callingCodes[0]}`
              : '',
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        setFilteredCountries(formattedCountries);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load countries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries on search
  const handleSearch = text => {
    setSearch(text);
    const filtered = countries.filter(
      c =>
        c.name.toLowerCase().includes(text.toLowerCase()) ||
        c.code.toLowerCase().includes(text.toLowerCase()) ||
        c.callingCode.includes(text),
    );
    setFilteredCountries(filtered);
  };

  const handleSendOTP = async () => {
    let formattedPhoneNumber = phoneNumber.trim();

    if (!formattedPhoneNumber) {
      toast.info({message: 'Please enter the phone number.'});
      return;
    }

    if (formattedPhoneNumber.startsWith('0')) {
      formattedPhoneNumber = formattedPhoneNumber.substring(1);
    }

    const fullPhoneNumber = `${country.callingCode}${formattedPhoneNumber}`;
    setIsLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', fullPhoneNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.info({message: 'This phone number is already registered.'});
        setIsLoading(false);
        return;
      }

      // const existingOTP = await AsyncStorage.getItem(`otp_${fullPhoneNumber}`);

      // if (existingOTP) {
      //   navigation.push('OTPVerification', {
      //     phone: fullPhoneNumber,
      //     otp: existingOTP,
      //     country: country.name,
      //   });
      //   return;
      // }

      // const otp = Math.floor(1000 + Math.random() * 9000).toString();
      // const response = await sendOTP(fullPhoneNumber, otp);

      // if (response?.success) {
      //   await AsyncStorage.setItem(`otp_${fullPhoneNumber}`, otp);
      setIsLoading(false);
      navigation.push('EnterEmail', {
        phone: fullPhoneNumber,
        country: country.name,
      });
    } catch (error) {
      console.log('OTP Error:', error);
      toast.danger({message: error.message || 'Error when sending OTP.'});
      setIsLoading(false);
    }
  };

  const selectCountry = selected => {
    setCountry(selected);
    setModalVisible(false);
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
          padding: 20,
          backgroundColor: Colors[theme].background,
          height: height * 0.92,
        }}>
        <CustomHeaderText title="What's your phone number?" />
        <Text style={{color: Colors[theme].gray, marginBottom: 20}}>
          Please enter your phone number to continue. Once entered, you can
          proceed to the next step.
        </Text>

        <View style={styles.phoneInputContainer}>
          <TouchableOpacity
            style={{
              width: '18%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Colors[theme].background,
              height: 50,
              borderRadius: 8,
            }}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.countryCodeText}>{country.callingCode}</Text>
          </TouchableOpacity>

          <View
            style={{width: '80%', backgroundColor: Colors[theme].background}}>
            <CustomInput
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
            />
          </View>
        </View>

        <CustomButton title="Send OTP" onPress={handleSendOTP} />

        {/* Country Code Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView
            style={{flex: 1, backgroundColor: Colors[theme].background}}>
            <View style={{padding: 20, flex: 1}}>
              <Text
                style={{
                  fontSize: 20,
                  marginBottom: 10,
                  color: Colors[theme].textColor,
                }}>
                Select Country
              </Text>

              <TextInput
                placeholder="Search country..."
                value={search}
                onChangeText={handleSearch}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  padding: 10,
                  marginBottom: 15,
                }}
              />

              {error && <Text style={{color: 'red'}}>{error}</Text>}
              <FlatList
                data={filteredCountries}
                keyExtractor={item => item.code}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={{
                      padding: 15,
                      borderBottomWidth: 1,
                      borderColor: '#ccc',
                    }}
                    onPress={() => {
                      selectCountry(item); // ✅ pass the full country object
                      setModalVisible(false);
                    }}>
                    <Text>{`${item.name} (${
                      item.callingCode || item.code
                    })`}</Text>
                  </TouchableOpacity>
                )}
              />

              <CustomButton
                title="Close"
                onPress={() => setModalVisible(!modalVisible)}
              />
            </View>
          </SafeAreaView>
        </Modal>
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
    phoneInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
      gap: 10,
    },
    countryCodeText: {
      color: Colors[theme].textColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default PhoneNumberScreen;
