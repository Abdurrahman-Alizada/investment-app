import React, {useEffect, useState, useContext, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import {auth} from '../utils/firebase';
import {Colours} from '../../constants/Details';
import Header from '../components/Header';
import {CurrencyContext} from '../../contexts/CurrencyContext';
import {interstitialAdId} from '../ads/adsConfig';
import {InterstitialAd, AdEventType} from 'react-native-google-mobile-ads';
import {Colors} from '../../constants/Colors';

const InvestmentListScreen = ({route, navigation}) => {
  const colourScheme = useColorScheme();
  const theme = colourScheme == 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const {investmentType, fromScreen} = route.params;
  const [investments, setInvestments] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [filter, setFilter] = useState('All'); // Active, Sold, All
  const {selectedCurrency, convertCurrency} = useContext(CurrencyContext);
  const [loaded, setLoaded] = useState(false);

  const adShownRef = useRef(false);

  const interstitial = InterstitialAd.createForAdRequest(interstitialAdId, {
    keywords: ['fashion', 'clothing'],
  });

  useEffect(() => {
    // Add event listeners for the interstitial ad
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('Interstitial Ad Loaded');
        setLoaded(true); // Mark the ad as loaded

        // Show the ad only if it hasn't been shown yet
        if (!adShownRef.current) {
          interstitial.show();
          adShownRef.current = true; // Mark the ad as shown
        }
      },
    );

    const unsubscribeOpened = interstitial.addAdEventListener(
      AdEventType.OPENED,
      () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(true); // Hide the status bar on iOS
        }
      },
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false); // Show the status bar on iOS
        }
        interstitial.load(); // Reload the ad after it is closed
        setLoaded(false); // Reset the loaded state until the new ad is loaded
      },
    );

    // Load the interstitial ad initially
    interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const db = getFirestore();
        const uid = auth.currentUser.uid;
        const investmentsRef = collection(db, 'users', uid, investmentType);

        const timeFieldMap = {
          goldInvestments: 'timeToInvest',
          apartmentInvestments: 'time',
          solarInvestments: 'time',
          stockInvestments: 'purchasedAt',
        };

        const timeField = timeFieldMap[investmentType];

        if (!timeField) {
          console.error('Invalid investmentType for time sorting');
          return;
        }

        const snapshot = await getDocs(
          query(investmentsRef, orderBy(timeField, 'desc')),
        );
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInvestments(fetched);
        setFilteredInvestments(fetched);
      } catch (error) {
        console.error('Error fetching investments:', error);
      }
    };

    fetchInvestments();
  }, [investmentType]);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredInvestments(investments);
    } else {
      const filtered = investments.filter(
        investment => investment.status?.toLowerCase() === filter.toLowerCase(),
      );
      setFilteredInvestments(filtered);
    }
  }, [filter, investments]);

  const getStatusColor = status => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'sold':
        return '#E53935';
      case 'collecting funds':
        return '#FFC107';
      default:
        return '#757575';
    }
  };

  const StatusBadge = ({status}) => (
    <View
      style={[
        styles.statusBadge,
        {backgroundColor: getStatusColor(status) + '20'},
      ]}>
      <Text style={[styles.statusText, {color: getStatusColor(status)}]}>
        {status}
      </Text>
    </View>
  );

  const isFilterable =
    investmentType === 'stockInvestments' ||
    investmentType === 'goldInvestments';

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {fromScreen} - {investmentType.replace('Investments', '')}
        </Text>
        <Text style={styles.headerSubtitle}>Your Investment Portfolio</Text>
      </View>

      {isFilterable && (
        <View style={styles.filterTabs}>
          {['All', 'Active', 'Sold'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterTab, filter === status && styles.activeTab]}
              onPress={() => setFilter(status)}>
              <Text
                style={[
                  styles.filterText,
                  filter === status && styles.activeTabText,
                ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {filteredInvestments?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="folder-open"
              size={48}
              color={Colours.primaryColour}
              style={{marginBottom: 12}}
            />
            <Text style={styles.emptyTitle}>No Investments Found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'All'
                ? 'You have not made any investments yet.'
                : `No "${filter}" investments available.`}
            </Text>
          </View>
        ) : (
          filteredInvestments.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.investmentId}>Investment #{item.id}</Text>
                  <Text style={styles.label}>Invested Amount</Text>
                  <Text style={styles.amount}>
                    {selectedCurrency}{' '}
                    {convertCurrency(
                      item?.investedAmount || 0,
                      selectedCurrency,
                    )}
                  </Text>
                  {item.status && <StatusBadge status={item.status} />}
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.label}>Profit</Text>
                  <Text style={styles.profit}>
                    {selectedCurrency}{' '}
                    {convertCurrency(item?.profit || 0, selectedCurrency)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate('InvestmentDetails', {
                      investment: item,
                      type: investmentType,
                    })
                  }>
                  <Text style={styles.buttonText}>View Details</Text>
                  <Icon name="chevron-right" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    header: {
      padding: 16,
      backgroundColor: Colors[theme].subHeader,
      borderBottomWidth: 1,
      borderBottomColor: '#E1E4E8',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors[theme].textColor,
    },
    headerSubtitle: {
      fontSize: 14,
      color: Colors[theme].gray,
      marginTop: 4,
    },
    scrollView: {
      flex: 1,
      padding: 16,
      backgroundColor: Colors[theme].background,
    },
    filterTabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: Colors[theme].background,
      paddingVertical: 12,
      // borderBottomWidth: 1,
      // borderBottomColor: '#E1E4E8',
    },
    filterTab: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: '#E5E7EB',
    },
    activeTab: {
      backgroundColor: Colours.primaryColour,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    activeTabText: {
      color: '#fff',
    },
    card: {
      backgroundColor: Colors[theme].subHeader,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    investmentId: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[theme].textColor,
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      color: Colors[theme].gray,
      marginBottom: 4,
    },
    amount: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors[theme].textColor,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E1E4E8',
    },
    profit: {
      fontSize: 18,
      fontWeight: '600',
      color: '#059669',
    },
    button: {
      backgroundColor: Colours.primaryColour,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      marginRight: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 48,
      padding: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: Colours.primaryColour,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
    },
  });

export default InvestmentListScreen;
