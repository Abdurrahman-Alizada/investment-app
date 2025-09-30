import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Image,
  useColorScheme,
} from 'react-native';
import {Colours} from '../../constants/Details';
import Header from '../components/Header';
import CustomHeaderText from '../components/CustomHeaderText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Drawer from '../components/Drawer';
import Overlay from '../components/animations/Overlay';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import {auth, db} from '../utils/firebase';
import {CurrencyContext} from '../../contexts/CurrencyContext';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import {useFocusEffect} from '@react-navigation/native';
import {bannerAdId, interstitialAdId} from '../ads/adsConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';
import axios from 'axios';
import {sendNotification} from '../utils/sendNotification';

const {width} = Dimensions.get('window');

export default function Home({navigation}) {
  // State management
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState(false);
  const [userData, setUserData] = useState({});
  const [recentInvestments, setRecentInvestments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [remainingDays, setRemainingDays] = useState(5);
  const [isRewardReady, setIsRewardReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {selectedCurrency, convertCurrency} = useContext(CurrencyContext);
  const user = auth.currentUser;

  console.log('bannerAdId', bannerAdId);

  // Initialize interstitial ad
  const interstitial = InterstitialAd.createForAdRequest(interstitialAdId, {
    keywords: ['fashion', 'clothing'],
  });

  useEffect(() => {
    checkReferralStatus();
  }, [userData]);

  // Ad event listeners
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => setLoaded(true),
    );

    const unsubscribeOpened = interstitial.addAdEventListener(
      AdEventType.OPENED,
      () => Platform.OS === 'ios' && StatusBar.setHidden(true),
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => Platform.OS === 'ios' && StatusBar.setHidden(false),
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.uid) {
        await getuserData();
        await fetchRecentInvestments();
        await fetchTotalAssets();
        await logReferralLoginIfNeeded();
      }
    };

    loadInitialData();
  }, [user?.uid]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        fetchTotalAssets();
        fetchRecentInvestments();
      }
    }, [user?.uid]),
  );

  // Data fetching functions (kept exactly as in your original code)
  const getuserData = async () => {
    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  const fetchTotalAssets = async () => {
    try {
      const userId = auth.currentUser.uid;
      const totalAssetsRef = collection(db, 'users', userId, 'totalAssets');

      const snapshot = await getDocs(totalAssetsRef);

      if (snapshot.empty) {
        console.warn('No total assets found for the user.');
        setUserData(prev => ({...prev, totalAssets: 0}));
        return;
      }

      let totalAssets = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        totalAssets += parseFloat(data.amount || 0);
      });

      setUserData(prev => ({...prev, totalAssets}));
    } catch (error) {
      console.error('Error fetching total assets:', error);
    }
  };

  const fetchRecentInvestments = async () => {
    try {
      const userId = auth.currentUser.uid;
      const types = [
        'solarInvestments',
        'goldInvestments',
        'apartmentInvestments',
        'stockInvestments',
      ];

      const promises = types.map(type => fetchInvestmentsByType(userId, type));
      const results = await Promise.all(promises);

      let allInvestments = results.flat();

      allInvestments.sort((a, b) => {
        const timeA = a.time?.toDate?.() || 0;
        const timeB = b.time?.toDate?.() || 0;
        return timeB - timeA;
      });

      setRecentInvestments(allInvestments);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchInvestmentsByType = async (userId, type) => {
    try {
      const investmentsRef = collection(db, 'users', userId, type);
      const querySnapshot = await getDocs(investmentsRef);

      if (querySnapshot.empty) {
        console.warn(`No data found for ${type}`);
        return [];
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        type,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error fetching investments for ${type}:`, error);
      return [];
    }
  };

  // Referral functions (kept exactly as in your original code)
  const logReferralLoginIfNeeded = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('logReferralLoginIfNeeded: No user is logged in');
      return;
    }

    const userId = user.uid;

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log('logReferralLoginIfNeeded: User document does not exist');
        return;
      }

      const userData = userDocSnap.data();

      if (
        userData.referreleByOtherUser &&
        (userData.referralRewardGiven === false ||
          userData.referralRewardGiven === undefined)
      ) {
        const today = new Date().toISOString().split('T')[0];
        const loginLogRef = doc(db, 'users', userId, 'loginLogs', today);

        const loginLogSnap = await getDoc(loginLogRef);
        if (loginLogSnap.exists()) {
          console.log("Today's login is already logged");
          return;
        }

        console.log("Logging today's login");
        await setDoc(loginLogRef, {
          timestamp: new Date(),
        });

        const totalLoginDays = await checkLoginDaysAndRewardReferrer(
          userId,
          userData.referredBy,
        );

        setStreakDays(totalLoginDays);
        setRemainingDays(5 - totalLoginDays);
        setShowStreakModal(true);
      } else {
        console.log('User not referred or already rewarded');
      }
    } catch (error) {
      console.error('logReferralLoginIfNeeded: Error occurred:', error);
    }
  };

  const checkLoginDaysAndRewardReferrer = async (refereeId, referrerId) => {
    const loginLogsRef = collection(db, 'users', refereeId, 'loginLogs');
    const loginSnapshots = await getDocs(loginLogsRef);

    const totalLoginDays = loginSnapshots.size;

    console.log('Total login days:', totalLoginDays);

    if (totalLoginDays >= 5) {
      const referrerCashDocRef = doc(
        db,
        'users',
        referrerId,
        'totalAssets',
        'cash',
      );
      await updateDoc(referrerCashDocRef, {
        amount: increment(100000),
      });

      const refereeDocRef = doc(db, 'users', refereeId);
      await updateDoc(refereeDocRef, {
        referralRewardGiven: true,
      });

      console.log('🎁 Referrer rewarded after 5 login days');
      setIsRewardReady(true);
    }

    return totalLoginDays;
  };

  const checkReferralStatus = async () => {
    try {
      const shown = await AsyncStorage.getItem('referral_modal_shown');
      console.log('Referral modal shown status:', shown);

      if (!shown) {
        console.log('Referral modal has not been shown yet.');

        if (userData && userData.hasOwnProperty('referreleByOtherUser')) {
          console.log(
            'Referral tag exists in userData:',
            userData.referreleByOtherUser,
          );
          setShowModal(false);
        } else {
          console.log('Referral tag does not exist in userData.');
          await AsyncStorage.setItem('referral_modal_shown', 'true');
          navigation.push('EnterReferral');
        }
      }
    } catch (error) {
      console.error('Error checking referral status:', error);
    }
  };

  const sendEmailOtp = async email => {
    try {
      const response = await fetch(
        'https://us-central1-huna-invest-88638.cloudfunctions.net/sendEmailOtp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-secret-key': 'hunaInvest2025', // இங்கே உங்கள் backend secret
          },
          body: JSON.stringify({email, otp: '123456'}), // OTP generate பண்ணி அனுப்பவேண்டும்
        },
      );

      const data = await response.json();
      console.log('OTP Response:', data);
      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const handleTestNotification = async () => {
    try {
      const result = await sendNotification({
        playerId: '5b9c65cc-6c76-453a-b33a-179bb0fa0449',
        heading: 'hii',
        message: 'this is a test notification',
      });
      console.log('Full notification result:', result);
      if (result.success) {
        console.log('Notification sent successfully:', result.data);
      } else {
        console.error('Notification failed:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error sending notification:', error);
    }
  };
  // Helper functions
  function getInvestmentDate(item) {
    const dateObj =
      item.time && typeof item.time.toDate === 'function'
        ? item.time.toDate()
        : item.time && typeof item.time === 'string'
        ? new Date(item.time)
        : item.timeToInvest && typeof item.timeToInvest.toDate === 'function'
        ? item.timeToInvest.toDate()
        : item.timeToInvest && typeof item.timeToInvest === 'string'
        ? new Date(item.timeToInvest)
        : item.purchasedAt && typeof item.purchasedAt.toDate === 'function'
        ? item.purchasedAt.toDate()
        : item.purchasedAt && typeof item.purchasedAt === 'string'
        ? new Date(item.purchasedAt)
        : null;

    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString();
  }

  // Investment plans data
  const investmentsPlans = [
    {
      id: 1,
      planName: 'Solar Power',
      subTitle: 'Clean Energy Investment',
      backgroundColor: '#4CAF50',
      icon: 'solar-power',
      screennavigation: () => navigation.navigate('SolarPosters'),
    },
    {
      id: 2,
      planName: 'Apartment',
      subTitle: 'Property Investment',
      backgroundColor: '#1976D2',
      icon: 'home-city',
      screennavigation: () => navigation.navigate('ApartmentPosters'),
    },
    {
      id: 3,
      planName: 'Gold',
      subTitle: 'Precious Metals',
      backgroundColor: '#FFA000',
      icon: 'gold',
      screennavigation: () => navigation.navigate('GoldPurchase'),
    },
    {
      id: 4,
      planName: 'Stocks',
      subTitle: 'Market Trading',
      backgroundColor: '#7B1FA2',
      icon: 'chart-line',
      screennavigation: () => navigation.navigate('StocksList'),
    },
  ];

  // Component render functions
  const InvestmentCard = ({item}) => (
    <TouchableOpacity
      onPress={item.screennavigation}
      style={styles.cardContainer}
      activeOpacity={0.9}>
      <View
        style={[
          styles.investmentCard,
          {backgroundColor: item.backgroundColor},
        ]}>
        <View style={styles.cardHeader}>
          <Icon name={item.icon} size={28} color="white" />
          <Icon name="chevron-right" size={20} color="white" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.planName}>{item.planName}</Text>
          <Text style={styles.subTitle}>{item.subTitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RecentInvestmentItem = ({item}) => (
    <TouchableOpacity style={styles.investmentItem} activeOpacity={0.9}>
      <View style={styles.investmentHeader}>
        <View style={styles.investmentInfo}>
          <Text style={styles.investmentName}>
            {item.planName ?? ''} {item.type?.replace('Investments', '')}
          </Text>
          <Text style={styles.investmentDate}>{getInvestmentDate(item)}</Text>
        </View>
        <Text style={styles.investmentAmount}>
          {selectedCurrency}{' '}
          {convertCurrency(item?.investedAmount || 0, selectedCurrency)}
        </Text>
      </View>
      <View style={styles.investmentFooter}>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: item.status === 'active' ? '#E8F5E9' : '#FFF3E0'},
          ]}>
          <Icon
            name={item.status === 'active' ? 'check-circle' : 'clock-outline'}
            size={14}
            color={item.status === 'active' ? '#2E7D32' : '#F57C00'}
            style={styles.statusIcon}
          />
          <Text
            style={[
              styles.statusText,
              {color: item.status === 'active' ? '#2E7D32' : '#F57C00'},
            ]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.returnsText}>{item.returns}</Text>
      </View>
    </TouchableOpacity>
  );

  // Main render
  return (
    <>
      <Drawer navigation={navigation} />
      <SafeAreaView style={styles.container}>
        <StatusBar style={theme} />
        <BannerAd
          unitId={bannerAdId}
          sizes={[
            BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
            BannerAdSize.FULL_BANNER,
          ]}
          onAdLoaded={() => console.log('Ad loaded!ghhh')}
          onAdFailedToLoad={err => console.log('Ad failed:', err)}
        />
        <View style={styles.content}>
          <Header
            hiddenBack={true}
            showMenu={true}
            active={active}
            navigation={navigation}
            showSetting
          />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.welcomeSection}>
              <CustomHeaderText title={`Welcome ${userData?.name ?? ''}`} />
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <View style={[styles.portfolioCard, {backgroundColor: '#6C63FF'}]}>
              <View style={styles.portfolioHeader}>
                <Text style={styles.portfolioLabel}>Total Asset Portfolio</Text>
                <Icon
                  name="wallet"
                  size={24}
                  color="rgba(255, 255, 255, 0.9)"
                />
              </View>
              <View style={styles.portfolioContent}>
                <Text style={styles.portfolioAmount}>
                  {selectedCurrency}{' '}
                  {convertCurrency(
                    userData?.totalAssets || 0,
                    selectedCurrency,
                  )}
                </Text>
                <TouchableOpacity
                  style={styles.investButton}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('Tabs', {screen: 'Portfolio'})
                  }
                  // onPress={handleTestNotification}
                >
                  <Text style={styles.investButtonText}>My Portfolio</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Investment Plans</Text>
              </View>
              <FlatList
                data={investmentsPlans}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansContainer}
                renderItem={({item}) => <InvestmentCard item={item} />}
                decelerationRate="fast"
                snapToInterval={width * 0.45 + 12}
                snapToAlignment="start"
              />
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Investments</Text>
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                  <Text style={styles.viewAllText}>
                    {showAll ? 'Show Less' : 'View All'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentInvestmentsContainer}>
                {recentInvestments.length === 0 ? (
                  <Text style={styles.noInvestmentsText}>
                    No recent investments found.
                  </Text>
                ) : (
                  (showAll
                    ? recentInvestments
                    : recentInvestments.slice(0, 3)
                  ).map(item => (
                    <RecentInvestmentItem key={item.id} item={item} />
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        <Overlay active={active} />

        {/* Referral Modal */}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={require('../../assets/refferral.png')}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <Text>Enter The Referral Code</Text>
            </View>
          </View>
        </Modal>

        {/* Streak Modal */}
        <Modal
          visible={showStreakModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStreakModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={require('../../assets/gift.png')}
                style={styles.modalImage}
                resizeMode="cover"
              />
              {isRewardReady ? (
                <>
                  <Text style={styles.modalTitle}>🎉 Congratulations!</Text>
                  <Text style={styles.modalMessage}>
                    You successfully logged in for 3 consecutive days and earned
                    your reward!
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowStreakModal(false);
                      console.log('Reward collected!');
                    }}>
                    <Text style={styles.modalButtonText}>Collect Reward</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>Keep Going!</Text>
                  <Text style={styles.modalMessage}>
                    You have logged in for {streakDays} consecutive days. Log in
                    for {remainingDays} more day(s) to earn your reward!
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowStreakModal(false)}>
                    <Text style={styles.modalButtonText}>Got It</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    content: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 80,
    },
    welcomeSection: {
      marginBottom: 16,
    },
    dateText: {
      fontSize: 14,
      color: Colors[theme].textColor,
      marginTop: 4,
    },
    portfolioCard: {
      marginBottom: 24,
      borderRadius: 16,
      overflow: 'hidden',
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
      flex: 1,
      padding: 16,
    },
    portfolioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    portfolioLabel: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 16,
      fontWeight: '500',
    },
    portfolioContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    portfolioAmount: {
      color: 'white',
      fontSize: 28,
      fontWeight: '700',
    },
    investButton: {
      backgroundColor: 'white',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    investButtonText: {
      color: '#6C63FF',
      fontWeight: '600',
      fontSize: 14,
    },
    sectionContainer: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors[theme].textColor,
    },
    viewAllText: {
      color: '#6C63FF',
      fontSize: 14,
      fontWeight: '600',
    },
    plansContainer: {
      paddingVertical: 8,
      paddingRight: 16,
    },
    cardContainer: {
      width: width * 0.45,
      marginRight: 12,
    },
    investmentCard: {
      padding: 16,
      borderRadius: 16,
      height: 140,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardContent: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    planName: {
      color: 'white',
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    subTitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 13,
    },
    recentInvestmentsContainer: {
      gap: 12,
    },
    investmentItem: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 0.5,
        },
      }),
    },
    investmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    investmentInfo: {
      flex: 1,
    },
    investmentName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1A1A1A',
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    investmentDate: {
      fontSize: 12,
      color: '#666',
    },
    investmentAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1A1A1A',
    },
    investmentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    statusIcon: {
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    returnsText: {
      fontSize: 14,
      fontWeight: '700',
    },
    noInvestmentsText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
      backgroundColor: Colors[theme].background,
      padding: 20,
      borderRadius: 16,
      width: '80%',
      alignSelf: 'center',
    },
    modalImage: {
      width: 120,
      height: 120,
      alignSelf: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalMessage: {
      textAlign: 'center',
      marginVertical: 10,
    },
    modalButton: {
      backgroundColor: Colours.primaryColour,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    modalButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
