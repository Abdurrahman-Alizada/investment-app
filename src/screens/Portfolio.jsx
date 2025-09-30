import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import Header from '../components/Header';
import {PieChart} from 'react-native-chart-kit';
import {Dimensions, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Animated, {FadeInDown} from 'react-native-reanimated';
import firestore from '@react-native-firebase/firestore';
import {auth, db} from '../utils/firebase';
import {CurrencyContext} from '../../contexts/CurrencyContext';
import {collection, getDocs, doc} from 'firebase/firestore';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig'; // Adjust the import path as necessary
import {Colors} from '../../constants/Colors';
import {height} from '../../constants/Details';
import {useFocusEffect} from '@react-navigation/native';

const Portfolio = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [investmentData, setInvestmentData] = useState([]);
  const {selectedCurrency, convertCurrency} = useContext(CurrencyContext);

  const uid = auth.currentUser.uid;

  useFocusEffect(
    useCallback(() => {
      if (uid) {
        fetchInvestments();
        fetchTotalAssets();
      }
    }, [uid]),
  );

  useEffect(() => {
    console.log('investmentData', investmentData);
    fetchInvestments();
    fetchTotalAssets();
  }, []);

  const fetchInvestments = async () => {
    try {
      const investmentTypes = [
        {type: 'stockInvestments', icon: 'chart-line'},
        {type: 'solarInvestments', icon: 'solar-power'},
        {type: 'goldInvestments', icon: 'gold'},
        {type: 'apartmentInvestments', icon: 'home-city'},
      ];

      let totalInvested = 0;
      let totalProfits = 0;
      const investmentData = [];

      // First, gather all investment data and calculate totalInvested and totalProfits
      for (const {type, icon} of investmentTypes) {
        // const snapshot = await firestore()
        const investmentRef = collection(db, 'users', uid, type); // Use modular API
        const snapshot = await getDocs(investmentRef);

        let typeInvested = 0;

        let typeProfit = 0;

        snapshot.forEach(doc => {
          const data = doc.data();
          typeInvested += data.investedAmount || 0;
          typeProfit += data.profit || 0;
        });

        totalInvested += typeInvested;
        totalProfits += typeProfit;

        investmentData.push({
          name: type.replace('Investments', ''), // e.g., "stocksInvestments" -> "stocks"
          invested: typeInvested,
          profit: typeProfit,
          color: getColorForType(type),
          icon: icon, // Add the icon here
        });
      }

      // Then, calculate percentages based on the final totalInvested
      const chartDataTemp = investmentData.map(investment => ({
        ...investment,
        percentage:
          parseFloat(
            ((investment.invested / totalInvested) * 100).toFixed(2),
          ) || 0,
      }));

      setTotalInvestment(totalInvested);
      setTotalProfit(totalProfits);
      // setChartData(chartDataTemp);
      setInvestmentData(chartDataTemp);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchTotalAssets = async () => {
    try {
      console.log('Fetching total assets...'); // Debug: Start of the function

      const totalAssetsRef = collection(db, 'users', uid, 'totalAssets'); // Use modular API

      const snapshot = await getDocs(totalAssetsRef);
      console.log(
        'Snapshot fetched:',
        snapshot.empty ? 'No data found' : 'Data found',
      ); // Debug: Check if snapshot is empty

      // Initialize all asset types with 0 amount
      const allAssets = [
        {id: 'cash', name: 'Cash', amount: 0, color: '#2196F3'},
        {id: 'solarInvestments', name: 'Solar', amount: 0, color: '#FFB74D'},
        {id: 'goldInvestments', name: 'Gold', amount: 0, color: '#FFD700'},
        {
          id: 'apartmentInvestments',
          name: 'Apartment',
          amount: 0,
          color: '#4CAF50',
        },
        {id: 'stockInvestments', name: 'Stock', amount: 0, color: '#673AB7'},
      ];

      // Update the amounts for assets found in Firestore
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`Processing document: ${doc.id}`, data); // Debug: Log each document's data

          const asset = allAssets.find(asset => asset.id === doc.id);
          if (asset) {
            asset.amount = parseFloat(data.amount || 0);
            console.log(
              `Updated asset: ${asset.name}, Amount: ${asset.amount}`,
            ); // Debug: Log updated asset
          }
        });
      } else {
        console.warn('No total assets found for the user.'); // Debug: Warn if no data is found
      }

      // Calculate the total amount
      const totalAmount = allAssets.reduce(
        (sum, asset) => sum + asset.amount,
        0,
      );
      console.log('Total amount calculated:', totalAmount); // Debug: Log total amount

      // Calculate percentages for the PieChart
      const chartDataTemp = allAssets.map(asset => ({
        name: asset.name,
        amount: asset.amount,
        percentage:
          totalAmount > 0
            ? parseFloat(((asset.amount / totalAmount) * 100).toFixed(2))
            : 0,
        color: asset.color,
      }));

      console.log('Chart data prepared:', chartDataTemp); // Debug: Log chart data

      setChartData(chartDataTemp);
    } catch (error) {
      console.error('Error fetching total assets:', error); // Debug: Log any errors
    }
  };

  const getColorForType = type => {
    switch (type) {
      case 'cash':
        return '#2196F3';
      case 'solarInvestments':
        return '#FFB74D';
      case 'goldInvestments':
        return '#FFD700';
      case 'apartmentInvestments':
        return '#4CAF50';
      case 'stockInvestments':
        return '#673AB7';
      default:
        return '#666';
    }
  };

  const formatName = name => {
    const formattedName = name.replace(/Investments$/, ''); // Remove "Investments"
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1); // Capitalize the first letter
  };

  return (
    <SafeAreaView style={styles.container}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Portfolio Overview</Text>
          <Text style={styles.subText}>Track your investments and returns</Text>
        </View>

        <View style={styles.summaryCards}>
          <View
            //  colors={['#1a237e', '#283593']}
            style={[styles.summaryCard, styles.elevation]}>
            <Icon name="wallet" size={24} color="white" />
            <Text style={styles.cardLabel}>Total Investment</Text>
            <Text style={styles.cardValue}>
              {selectedCurrency}{' '}
              {convertCurrency(totalInvestment, selectedCurrency)}
            </Text>
          </View>

          <View
            colors={['#1b5e20', '#2e7d32']}
            style={[
              styles.summaryCard,
              styles.elevation,
              {backgroundColor: '#2e7d32'},
            ]}>
            <Icon name="trending-up" size={24} color="white" />
            <Text style={styles.cardLabel}>Total Profit</Text>
            <Text style={styles.cardValue}>
              {selectedCurrency}{' '}
              {convertCurrency(totalProfit, selectedCurrency)}
            </Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Investment Distribution</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData.map(({name, percentage, color}) => ({
                name: name, // Add percentage mark
                population: percentage,
                color,
                legendFontColor: '#666',
                legendFontSize: 12,
              }))}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={
                {
                  // borderRadius: 12,
                }
              }
            />
          </View>
        </View>

        <View style={styles.investmentsSection}>
          <Text style={styles.sectionTitle}>Your Investments</Text>
          {investmentData.map((investment, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(index * 100)}
              style={styles.investmentCard}>
              <TouchableOpacity
                style={styles.investmentContent}
                onPress={() =>
                  navigation.navigate('InvestmenList', {
                    investmentType: `${investment.name}Investments`, // Pass the investment type
                    fromScreen: 'Portfolio', // Pass the current screen name
                  })
                }>
                <View style={styles.investmentHeader}>
                  <View style={styles.investmentIcon}>
                    <Icon
                      name={investment.icon}
                      size={24}
                      color={investment.color}
                    />
                  </View>
                  <View style={styles.investmentInfo}>
                    <Text style={styles.investmentName}>{investment.name}</Text>
                    <Text style={styles.investmentPercentage}>
                      {investment.percentage}% of portfolio
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </View>
                <View style={styles.investmentDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Invested</Text>
                    <Text style={styles.detailValue}>
                      {selectedCurrency}{' '}
                      {convertCurrency(
                        investment?.invested || 0,
                        selectedCurrency,
                      )}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Profit</Text>
                    <Text style={[styles.detailValue, {color: '#2e7d32'}]}>
                      LKR {selectedCurrency}{' '}
                      {convertCurrency(
                        (investment?.profit).toFixed(2) || 0,
                        selectedCurrency,
                      )}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Portfolio;

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    scrollView: {
      // flex: 1,
      height: height * 0.91,
      backgroundColor: Colors[theme].background,
      marginBottom: 80,
    },
    headerSection: {
      padding: 16,
      backgroundColor: Colors[theme].subHeader,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors[theme].textColor,
    },
    subText: {
      fontSize: 14,
      color: Colors[theme].gray,
      marginTop: 4,
    },
    summaryCards: {
      flexDirection: 'row',
      padding: 16,

      gap: 12,
      height: 'auto',
      width: 'auto',
    },
    summaryCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'flex-start',
      backgroundColor: '#283593',
    },
    // elevation: {
    //   shadowColor: '#000',
    //   shadowOffset: {
    //     width: 0,
    //     height: 2,
    //   },
    //   shadowOpacity: 0.1,
    //   shadowRadius: 3.84,
    //   elevation: 2,
    // },
    cardLabel: {
      color: 'white',
      fontSize: 14,
      marginTop: 8,
      opacity: 0.9,
    },
    cardValue: {
      color: 'white',
      fontSize: 18,
      fontWeight: '700',
      marginTop: 4,
    },
    chartSection: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[theme].textColor,
      marginBottom: 12,
    },
    chartContainer: {
      alignItems: 'center',
      backgroundColor: Colors[theme].buttonBackground,
      borderRadius: 12,
      padding: 8,
      marginTop: 8,
    },
    investmentsSection: {
      padding: 16,
    },
    investmentCard: {
      backgroundColor: Colors[theme].buttonBackground,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: Colors[theme].buttonBackground,
    },
    investmentContent: {
      padding: 16,
    },
    investmentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    investmentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f8f9fa',
      justifyContent: 'center',
      alignItems: 'center',
    },
    investmentInfo: {
      flex: 1,
      marginLeft: 12,
    },
    investmentName: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[theme].textColor,
      textTransform: 'capitalize',
    },
    investmentPercentage: {
      fontSize: 13,
      color: Colors[theme].textColor,
      marginTop: 2,
    },
    investmentDetails: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
    detailItem: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 13,
      color: Colors[theme].gray,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors[theme].textColor,
      marginTop: 2,
    },
    transactionsSection: {
      padding: 16,
      paddingBottom: 32,
    },
    transactionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#f0f0f0',
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f8f9fa',
      justifyContent: 'center',
      alignItems: 'center',
    },
    transactionInfo: {
      flex: 1,
      marginLeft: 12,
    },
    transactionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1a1a1a',
    },
    transactionDate: {
      fontSize: 13,
      color: '#666',
      marginTop: 2,
    },
    transactionAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1a1a1a',
      marginTop: 2,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f1f8e9',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      color: '#2e7d32',
      marginLeft: 4,
    },
  });
