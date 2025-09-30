// screens/CountrySelectionScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Image,
  SafeAreaView,
  Dimensions,
  Platform,
  useColorScheme,
} from 'react-native';
import Header from '../components/Header';
import {Colours} from '../../constants/Details';
import SearchInput from '../components/SearchInput';
import {doc, setDoc} from 'firebase/firestore';
import {db} from '../utils/firebase';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';
import {sendNotification} from '../utils/sendNotification';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig';

const {width, height} = Dimensions.get('window');

const CountrySelectionScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);
  console.log('theme', theme);

  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(
        'https://restcountries.com/v2/all?fields=name,alpha2Code,callingCodes',
      );
      const data = await response.json();

      const formattedCountries = data
        .map(country => ({
          code: country.alpha2Code,
          name: country.name,
          callingCode: country.callingCodes?.[0]
            ? `+${country.callingCodes[0]}`
            : '',
          flag: `https://flagcdn.com/w80/${country.alpha2Code.toLowerCase()}.png`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountries(formattedCountries);
      setFilteredCountries(formattedCountries);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load countries. Please try again later.');
      setLoading(false);
    }
  };

  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredCountries(filtered);
  };

  const handleTestNotification = async () => {
    await sendNotification(
      '5b9c65cc-6c76-453a-b33a-179bb0fa0449',
      'hii',
      'this is a test notification',
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <View
        style={{
          width: '100%',
          height: height * 0.95,
          backgroundColor: Colors[theme].background,
          padding: 20,
        }}>
        <Text style={styles.title}>Select country of residence</Text>
        <Text style={styles.subtitle}>
          Please choose a country carefully, as you can only verify your phone
          number with the selected country code.
        </Text>

        <View style={{marginVertical: 20}}>
          <SearchInput
            placeholder="Search for a country"
            value={searchQuery} // Pass the state value
            onSearch={handleSearch} // Handle search function
          />
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={item => item.code}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.countryItem}
              onPress={() => {
                navigation.navigate('PhoneNumber', {country: item});
              }}>
              <Image source={{uri: item.flag}} style={styles.flagIcon} />
              <View style={styles.countryInfo}>
                <Text style={styles.countryName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={{
            paddingVertical: 20,
            flexDirection: 'row',
            justifyContent: 'center',

            borderTopWidth: 1,
            borderColor: 'lightgray',
            width: '100%',
            ...Platform.select({
              ios: {
                height: 120,
              },
              android: {
                paddingTop: 20,
                alignItems: 'center',
              },
            }),
          }}>
          <Text style={{color: Colors[theme].textColor, fontSize: 16}}>
            Already have an account?{' '}
            <Text
              style={{
                color: Colours.primaryColour,
                fontWeight: '600',
              }}
              onPress={() => navigation.push('Login')}>
              Login
            </Text>
          </Text>
        </View>
      </View>
      {loading && <LoaderAnim />}
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
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors[theme].background,
    },
    title: {
      fontSize: 30,
      fontWeight: '900',
      marginBottom: 10,
      color: Colors[theme].textColor,
    },
    subtitle: {
      color: Colors[theme].gray,
    },
    searchInput: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 2,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginVertical: 20,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    flagIcon: {
      width: 30,
      height: 30,
      marginRight: 15,
      borderRadius: 100,
    },
    countryInfo: {
      flex: 1,
    },
    countryName: {
      fontSize: 16,
      color: Colors[theme].textColor,
      fontWeight: '700',
    },
    countryCode: {
      fontSize: 14,
      color: 'white',
    },
    errorText: {
      fontSize: 16,
      color: Colors[theme].red,
    },
    login: {
      // padding:20,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: Colours.primaryColour,
      width: 60,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginRight: 20,
      marginTop: 20,
    },
  });

export default CountrySelectionScreen;
