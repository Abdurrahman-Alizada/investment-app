import React, {useState, useEffect} from 'react';
import {
  useColorScheme,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import CustomModal from '../components/CustomModal';

import {auth, db} from '../utils/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Colours} from '../../constants/Details';
import SuccessModal from '../components/SuccessModal';
import {doc, getDoc, collection, setDoc, updateDoc} from 'firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';
import {serverTimestamp} from 'firebase/firestore';
import {
  BannerAd,
  BannerAdSize,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import {bannerAdId, rewardedAdId} from '../ads/adsConfig';
import {toast} from '../../helpers/toast';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';

const {width} = Dimensions.get('window');

const GoldBuyingScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [goldPriceAED, setGoldPriceAED] = useState(null);
  const [goldPriceLKR, setGoldPriceLKR] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [goldInGrams, setGoldInGrams] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRewardedAdLoaded, setIsRewardedAdLoaded] = useState(false);

  useEffect(() => {
    initReward();
  }, []);

  useEffect(() => {
    fetchGoldPrice();

    console.log(goldPriceAED);
  }, [goldPriceAED]);

  useEffect(() => {
    calculateGoldAmount();
  }, [investmentAmount, goldPriceAED, goldPriceLKR, selectedCurrency]);

  const initReward = async () => {
    const rewardedAd = RewardedAd.createForAdRequest(rewardedAdId);
    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsRewardedAdLoaded(rewardedAd);
      console.log('rewarded ad loaded');
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log('User earned reward of ', reward);
      handleBonusReward();
      // Handle the reward here, e.g., update user balance
    });

    rewardedAd.load();
  };

  const fetchGoldPrice = async () => {
    try {
      const goldPriceRef = doc(db, 'goldPrices', 'currentPrice');
      const goldPriceSnapshot = await getDoc(goldPriceRef);

      if (goldPriceSnapshot.exists()) {
        const data = goldPriceSnapshot.data();
        setGoldPriceLKR(data.price);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gold price:', error);
      setLoading(false);
    }
  };

  // const convertToLKR = async (aedPrice) => {
  //   try {
  //     const response = await axios.get("https://api.exchangerate-api.com/v4/latest/AED");
  //     const rate = response.data.rates.LKR;
  //     setGoldPriceLKR((aedPrice * rate).toFixed(2));
  //     setExchangeRate(rate);
  //   } catch (error) {
  //     console.error("Error fetching exchange rate:", error);
  //   }
  // };

  const calculateGoldAmount = () => {
    const pricePerGram =
      selectedCurrency === 'AED' ? goldPriceAED : goldPriceLKR;
    if (pricePerGram && investmentAmount) {
      const grams = parseFloat(investmentAmount) / pricePerGram;
      setGoldInGrams(grams);
    } else {
      setGoldInGrams(0);
    }
  };

  const adReward = async () => {
    if (!goldPriceLKR) {
      console.error(
        'Gold price (LKR) is not available. Please try again later.',
      );
      return;
    }

    setModalVisible(false);
    setLoading(true);
    try {
      const investmentAmountFloat = parseFloat(investmentAmount);
      if (isNaN(investmentAmountFloat) || investmentAmountFloat <= 0) {
        console.error('Invalid investment amount.');
        setLoading(false);
        return;
      }

      if (!isRewardedAdLoaded) {
        Alert.alert('Ad Not Ready', 'Please wait for the ad to load.');
        setLoading(false);
        return;
      }

      isRewardedAdLoaded.removeAllListeners();

      isRewardedAdLoaded.show();
      isRewardedAdLoaded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        async () => {
          console.log('User earned reward from daily claim');
          await uploadGoldInvestment(); // Separate function for reward processing
        },
      );
    } catch (error) {
      console.error('Error parsing investment amount:', error);
      setLoading(false);
    }
  };

  const uploadGoldInvestment = async () => {
    try {
      const userId = auth.currentUser.uid;
      if (!userId) throw new Error('User not logged in');

      // Fetch user's cash amount
      const investmentAmountFloat = parseFloat(investmentAmount);

      const totalAssetsRef = collection(db, 'users', userId, 'totalAssets');
      const cashDocRef = doc(totalAssetsRef, 'cash');
      const cashSnapshot = await getDoc(cashDocRef);

      let currentCash = 0;
      if (cashSnapshot.exists()) {
        currentCash = parseFloat(cashSnapshot.data().amount) || 0;
      } else {
        console.warn('Cash document not found! Assuming cash is 0.');
      }

      console.log('User Cash Amount:', currentCash);

      // Check if the investment amount exceeds the user's cash
      if (investmentAmountFloat > currentCash) {
        console.warn('Investment amount exceeds available cash!');
        toast.info({
          message: 'Insufficient cash. Please adjust your investment amount.',
        });
        setLoading(false);
        return;
      }

      // Generate a unique investment ID
      const investmentId = doc(collection(db, 'random')).id;

      // Reference to the specific investment document
      const goldInvestmentRef = doc(
        collection(db, 'users', userId, 'goldInvestments'),
        investmentId,
      );

      await setDoc(goldInvestmentRef, {
        timeToInvest: serverTimestamp(),
        investedGoldGram: goldInGrams,
        investedAmount: investmentAmountFloat,
        pricePerGram: parseFloat(goldPriceLKR).toFixed(2),
        investmentId: investmentId,
        status: 'active',
      });

      // Deduct from cash
      const newCashAmount = currentCash - investmentAmountFloat;
      await updateDoc(cashDocRef, {amount: newCashAmount});
      console.log('Cash updated successfully:', newCashAmount);

      // Add to goldInvestments
      const goldInvestmentsDocRef = doc(totalAssetsRef, 'goldInvestments');
      const goldInvestmentsSnapshot = await getDoc(goldInvestmentsDocRef);
      if (goldInvestmentsSnapshot.exists()) {
        const currentGoldInvestment =
          parseFloat(goldInvestmentsSnapshot.data().amount) || 0;
        const newGoldInvestmentAmount =
          currentGoldInvestment + investmentAmountFloat;
        await updateDoc(goldInvestmentsDocRef, {
          amount: newGoldInvestmentAmount,
        });

        //update to the dashboardData
        console.log(
          'Gold investments updated successfully:',
          newGoldInvestmentAmount,
        );
      } else {
        console.warn(
          'Gold investments document not found! Creating a new one.',
        );
        await setDoc(goldInvestmentsDocRef, {amount: investmentAmountFloat});
      }

      // Step 6: Update DashboardDataCollection/InvestmentsDocID
      const dashboardRef = doc(db, 'DashboardData', 'Investments');
      const dashboardSnapshot = await getDoc(dashboardRef);

      let total = 0;
      let gold = 0;

      if (dashboardSnapshot.exists()) {
        const data = dashboardSnapshot.data();
        total = parseFloat(data.TotalInvestment) || 0;

        const updatedData = {
          TotalInvestment: total + investmentAmountFloat,
          GoldInvestment: gold + investmentAmountFloat,
        };

        await updateDoc(dashboardRef, updatedData);
        console.log('Dashboard investment summary updated successfully.');
      } else {
        // Document doesn't exist, create a new one
        const newData = {
          TotalInvestment: investmentAmountFloat,
          GoldInvestment: investmentAmountFloat,
        };

        await setDoc(dashboardRef, newData);
        console.log('Dashboard investment summary created successfully.');
      }

      setLoading(false);
      setModalSuccessVisible(true);
    } catch (error) {
      console.error('Error uploading investment data:', error);
      setLoading(false);
    }
  };

  const handleConfirmPress = () => {
    setModalSuccessVisible(false);

    navigation.navigate('Drawer', {
      screen: 'Tabs',
      params: {
        screen: 'Home',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Gold Investment</Text>
            <Text style={styles.subtitle}>
              Current market prices and investment calculator
            </Text>
          </View>

          <View style={styles.priceCard}>
            <View
              // colors={['#FFD700', '#FFA500']}
              style={styles.gradientContainer}
              // start={{x: 0, y: 0}}
              // end={{x: 1, y: 1}}
            >
              <View style={styles.priceHeader}>
                <Icon name="gold" size={32} color="white" />
                <Text style={styles.priceLabel}>Live Gold Price</Text>
              </View>
              {loading ? (
                <Text style={styles.loadingText}>
                  Fetching latest prices...
                </Text>
              ) : (
                <View style={styles.priceContent}>
                  <View style={styles.priceRow}>
                    {/* <Text style={styles.priceText}>AED {goldPriceAED?.toFixed(2)}</Text> */}
                    {/* <Text style={styles.perGramText}>per gram</Text> */}
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>LKR {goldPriceLKR}</Text>
                    <Text style={styles.perGramText}>per gram</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.calculatorSection}>
            {/* <Text style={styles.sectionTitle}>Investment Calculator</Text> */}

            {/* <View style={styles.currencySelector}>
              <TouchableOpacity
                style={[styles.currencyButton, selectedCurrency === 'AED' && styles.selectedCurrency]}
                onPress={() => setSelectedCurrency('AED')}
              >
                <Icon 
                  name={selectedCurrency === 'AED' ? 'check-circle' : 'circle-outline'} 
                  size={24} 
                  color={selectedCurrency === 'AED' ? '#FFD700' : '#666'} 
                />
                <Text style={[styles.currencyText, selectedCurrency === 'AED' && styles.selectedCurrencyText]}>
                  AED
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.currencyButton, selectedCurrency === 'LKR' && styles.selectedCurrency]}
                onPress={() => setSelectedCurrency('LKR')}
              >
                <Icon 
                  name={selectedCurrency === 'LKR' ? 'check-circle' : 'circle-outline'} 
                  size={24} 
                  color={selectedCurrency === 'LKR' ? '#FFD700' : '#666'} 
                />
                <Text style={[styles.currencyText, selectedCurrency === 'LKR' && styles.selectedCurrencyText]}>
                  LKR
                </Text>
              </TouchableOpacity>
            </View> */}

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                Investment Amount ({selectedCurrency})
              </Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="cash"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder={`Enter amount in ${selectedCurrency}`}
                  placeholderTextColor="#999"
                  value={investmentAmount}
                  onChangeText={setInvestmentAmount}
                />
              </View>
            </View>

            <View style={styles.resultCard}>
              <Icon name="scale-balance" size={32} color="#FFD700" />
              <Text style={styles.resultLabel}>Estimated Gold</Text>
              <Text style={styles.resultValue}>{goldInGrams} grams</Text>
            </View>

            <TouchableOpacity
              style={styles.investButton}
              onPress={() => setModalVisible(true)}>
              <View
                // colors={['#FFD700', '#FFA500']}
                style={styles.gradientButton}
                // start={{x: 0, y: 0}}
                // end={{x: 1, y: 0}}
              >
                <Icon name="cart" size={24} color="white" />
                <Text style={styles.buttonText}>Proceed to Purchase</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        title="Confirm Gold Purchase"
        iconName="gold"
        subtitle={`You are about to purchase ${goldInGrams} grams of gold for ${selectedCurrency} ${investmentAmount}`}
        onConfirm={adReward}
        onCancel={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />

      <SuccessModal
        visible={modalSuccessVisible}
        title="Success!"
        subtitle="Your action was completed successfully."
        onConfirm={handleConfirmPress}
        type="success"
      />

      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    content: {
      padding: 16,
    },
    headerSection: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: Colors[theme].textColor,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: Colors[theme].gray,
    },
    priceCard: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    gradientContainer: {
      padding: 20,
      backgroundColor: Colours.primaryColour,
    },
    priceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    priceLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: 'white',
      marginLeft: 12,
    },
    loadingText: {
      color: 'white',
      fontSize: 16,
    },
    priceContent: {
      gap: 12,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    priceText: {
      fontSize: 24,
      fontWeight: '700',
      color: 'white',
    },
    perGramText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    calculatorSection: {
      backgroundColor: Colors[theme].buttonBackground,
      borderRadius: 16,
      padding: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1A1A1A',
      marginBottom: 16,
    },
    currencySelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 24,
    },
    currencyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: '#F8F9FA',
      width: width * 0.4,
      justifyContent: 'center',
      gap: 8,
    },
    selectedCurrency: {
      backgroundColor: '#FFF8E1',
    },
    currencyText: {
      fontSize: 16,
      color: '#666',
      fontWeight: '600',
    },
    selectedCurrencyText: {
      color: '#FFD700',
    },
    inputSection: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 16,
      color: '#666',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#E1E1E1',
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: '#1A1A1A',
    },
    resultCard: {
      alignItems: 'center',
      backgroundColor: Colours.subButton,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    resultLabel: {
      fontSize: 16,
      color: 'white',
      marginVertical: 8,
      fontWeight: '600',
    },
    resultValue: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFD700',
    },
    investButton: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    gradientButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 8,
      backgroundColor: Colours.primaryColour,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default GoldBuyingScreen;
