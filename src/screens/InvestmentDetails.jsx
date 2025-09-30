import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import {Colours} from '../../constants/Details';
import {
  doc,
  collection,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import Icon2 from 'react-native-vector-icons/Ionicons';
import {auth, db} from '../utils/firebase';
import CustomButton from '../components/CustomButtom';
import CustomModal from '../components/CustomModal';

import {CurrencyContext} from '../../contexts/CurrencyContext';
import {bannerAdId} from '../ads/adsConfig';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';
// import { db,auth } from '../utils/firebase';

const InvestmentDetailsScreen = ({route, navigation}) => {
  let manualTestDate = '2025-05-26T05:48:49.000Z';

  const colourScheme = useColorScheme();
  const theme = colourScheme == 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const {investment, type} = route.params;
  const [posterDetails, setPosterDetails] = useState(null);
  const [currentGoldPrice, setCurrentGoldPrice] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentStockPrice, setCurrentStockPrice] = useState(0);
  const [profitOrLoss, setProfitOrLoss] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [investmentData, setInvestmentData] = useState(null); // State to store live investment data
  const {selectedCurrency, convertCurrency} = React.useContext(CurrencyContext);

  useEffect(() => {
    fetchCurrentGoldPrice();
    if (type === 'solarInvestments' || type === 'apartmentInvestments') {
      fetchPosterDetails();
    } else if (type === 'stockInvestments') {
      fetchCurrentStockPrice(investment.symbol);
      fetchPriceAndCalculateProfit();
    }
    fetchInvestmentData();

    console.log(investmentData);
  }, [type, investment.id, currentStockPrice]);

  const fetchInvestmentData = async () => {
    console.log('investment id', investment.id);

    try {
      setLoading(true);
      const userId = auth.currentUser.uid;

      if (!userId) {
        console.warn('User not logged in!');
        setLoading(false);
        return;
      }

      const investmentRef = doc(
        collection(db, 'users', userId, type),
        investment.id,
      );

      const investmentSnapshot = await getDoc(investmentRef);
      if (investmentSnapshot.exists()) {
        setInvestmentData(investmentSnapshot.data());
      } else {
        console.warn('Investment not found!');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching investment data:', error);
      setLoading(false);
    }
  };

  const fetchPosterDetails = async () => {
    console.log('called fetchposter funstions');

    try {
      let posterRef;

      if (type === 'solarInvestments') {
        posterRef = doc(
          collection(
            db,
            'investmentPosters',
            'BpXWNAOoq7fVubDc77cJ',
            'solarPosters',
          ),
          investment.solarId,
        );
      } else if (type === 'apartmentInvestments') {
        posterRef = doc(
          collection(
            db,
            'investmentPosters',
            'VrT66Kjql1FZpiKwKeG3',
            'apartmentPosters',
          ),
          investment.apartmentId,
        );
      }

      if (posterRef) {
        const posterSnapshot = await getDoc(posterRef);
        if (posterSnapshot.exists()) {
          setPosterDetails(posterSnapshot.data());
        } else {
          console.warn('Poster details not found for this investment.');
        }
      }

      const investmentTypeRef =
        type === 'solarInvestments'
          ? 'solarInvestments'
          : 'apartmentInvestments';
      const userInvestmentRef = doc(
        collection(db, 'users', auth.currentUser.uid, investmentTypeRef),
        investment.id,
      );

      const userInvestmentSnapshot = await getDoc(userInvestmentRef);
      if (userInvestmentSnapshot.exists()) {
        const userInvestmentData = userInvestmentSnapshot.data();
        setPosterDetails(prevDetails => ({
          ...prevDetails,
          lastClaimedYear: userInvestmentData.lastClaimedYear,
          lastClaimedMonth: userInvestmentData.lastClaimedMonth,
        }));
      } else {
        console.warn('User-specific investment details not found.');
      }
    } catch (error) {
      console.error('Error fetching poster details:', error);
    }
  };

  const fetchCurrentGoldPrice = async () => {
    try {
      const goldRef = doc(collection(db, 'goldPrices'), 'currentPrice');
      const docSnapshot = await getDoc(goldRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        setCurrentGoldPrice(data.price);
      } else {
        console.warn('No current gold price found.');
      }
    } catch (error) {
      console.error('Error fetching current gold price:', error);
    }
  };

  const fetchCurrentStockPrice = async stockSymbol => {
    if (!stockSymbol) {
      console.warn('Stock symbol is undefined or missing.');
      return 0; // Return 0 as a fallback value
    }

    try {
      const stockRef = collection(db, 'cseStocks');
      const stockQuery = query(stockRef, where('symbol', '==', stockSymbol));
      const querySnapshot = await getDocs(stockQuery);

      if (!querySnapshot.empty) {
        const stockData = querySnapshot.docs[0].data();

        return stockData.price || 0;
      } else {
        console.warn('Stock data not found for symbol:', stockSymbol);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching current stock price:', error);
      return 0;
    }
  };

  const fetchPriceAndCalculateProfit = async () => {
    if (type === 'stockInvestments' && investment.stockSymbol) {
      const currentPrice = await fetchCurrentStockPrice(investment.stockSymbol);
      setCurrentStockPrice(currentPrice);

      const profitOrLoss =
        (currentPrice - investment.stockPrice) * investment.stockCount;

      setProfitOrLoss(profitOrLoss);
    }
  };

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInvestmentTypeTitle = () => {
    switch (type) {
      case 'goldInvestments':
        return 'Gold Investment';
      case 'solarInvestments':
        return 'Solar Investment';
      case 'apartmentInvestments':
        return 'Apartment Investment';
      default:
        return 'Investment Details';
    }
  };

  const getInvestmentIcon = () => {
    switch (type) {
      case 'gold':
        return 'gold';
      case 'solar':
        return 'solar-power';
      case 'apartment':
        return 'home';
      default:
        return 'cash';
    }
  };

  const renderGoldInvestmentDetails = () => {
    if (!investmentData) {
      return (
        <Text style={styles.loadingText}>
          Loading gold investment details...
        </Text>
      );
    }

    const handleSellGold = async () => {
      setModalVisible(false); // Close the modal
      setLoading(true); // Start loading
      try {
        const userId = auth.currentUser.uid;
        if (!userId) {
          console.warn('User not logged in!');
          setLoading(false); // Stop loading
          return;
        }

        // Reference to the user's gold investment document
        const goldInvestmentRef = doc(
          collection(db, 'users', userId, 'goldInvestments'),
          investment.id,
        );

        // Calculate profit or loss
        const status = profitOrLoss >= 0 ? 'Profit' : 'Loss';
        const profitOrLossValue = Math.abs(profitOrLoss);

        const updateFields =
          profitOrLoss >= 0
            ? {profit: profitOrLossValue, loss: 0} // Profit scenario
            : {profit: 0, loss: profitOrLossValue}; // Loss scenario

        // Update the gold investment document with status and profit/loss
        await updateDoc(goldInvestmentRef, {
          investedAmount: investment.investedAmount,
          status: 'sold',
          ...updateFields, // Spread the calculated profit/loss fields
          profitOrLoss: profitOrLossValue,
          profitOrLossType: status,
          soldAt: serverTimestamp(), // Add timestamp for when it was sold
        });

        // Update totalAssets collection
        const totalAssetsRef = collection(db, 'users', userId, 'totalAssets');

        // Add the sold amount to cash
        const cashDocRef = doc(totalAssetsRef, 'cash');
        const cashSnapshot = await getDoc(cashDocRef);
        const currentValue = investment.investedGoldGram * currentGoldPrice; // Calculate the current value of the gold investment
        if (cashSnapshot.exists()) {
          const currentCash = parseFloat(cashSnapshot.data().amount) || 0;
          const newCashAmount = currentCash + currentValue; // Add the current value of the gold investment
          console.log('Current Cash:', currentCash);
          console.log('Updated Cash:', newCashAmount);
          await updateDoc(cashDocRef, {amount: newCashAmount});
          console.log('Cash updated successfully:', newCashAmount);
        } else {
          console.warn('Cash document not found! Creating a new one.');
          await setDoc(cashDocRef, {amount: currentValue});
          console.log('New Cash document created:', currentValue);
        }

        // Deduct the sold amount from goldInvestments
        const goldInvestmentsDocRef = doc(totalAssetsRef, 'goldInvestments');
        const goldInvestmentsSnapshot = await getDoc(goldInvestmentsDocRef);
        if (goldInvestmentsSnapshot.exists()) {
          const currentGoldInvestment =
            parseFloat(goldInvestmentsSnapshot.data().amount) || 0;
          const newGoldInvestmentAmount =
            currentGoldInvestment - investment.investedAmount; // Deduct the invested value
          console.log('Current Gold Investment:', currentGoldInvestment);
          console.log('Updated Gold Investment:', newGoldInvestmentAmount);
          await updateDoc(goldInvestmentsDocRef, {
            amount: newGoldInvestmentAmount,
          });
          console.log(
            'Gold investments updated successfully:',
            newGoldInvestmentAmount,
          );
        } else {
          console.warn('Gold investments document not found!');
        }

        console.log('Gold investment sold successfully.');

        const dashboardRef = doc(db, 'DashboardData', 'Profits');
        const dashboardSnapshot = await getDoc(dashboardRef);

        let totalProfit = 0;
        let goldProfit = 0;

        if (dashboardSnapshot.exists()) {
          const data = dashboardSnapshot.data();
          totalProfit = parseFloat(data.TotalProfit) || 0;
          goldProfit = parseFloat(data.Gold) || 0;

          const newProfit =
            status === 'Profit' ? profitOrLossValue : -profitOrLossValue; // Subtract if loss

          const updatedData = {
            TotalProfit: totalProfit + newProfit,
            Gold: goldProfit + newProfit,
          };

          await updateDoc(dashboardRef, updatedData);
          console.log('Dashboard profit summary updated successfully.');
        } else {
          const newProfit =
            status === 'Profit' ? profitOrLossValue : -profitOrLossValue;

          const newData = {
            TotalProfit: newProfit,
            Gold: newProfit,
          };

          await setDoc(dashboardRef, newData);
          console.log('Dashboard profit summary created successfully.');
        }

        // Navigate back to the previous screen
        navigation.goBack();
      } catch (error) {
        console.error('Error selling gold:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    const investedGoldGram = investmentData.investedGoldGram || 0;

    const pricePerGram = investment.pricePerGram || 0;

    // Calculate current value and profit/loss
    const currentValue = investedGoldGram * currentGoldPrice;

    const investedValue = investedGoldGram * pricePerGram;
    const profitOrLoss = currentValue - investedValue;

    return (
      <>
        <DetailRow
          icon="scale-balance"
          label="Gold Gram"
          value={`${investmentData.investedGoldGram || 0} grams`}
        />
        {/* <DetailRow
        icon="gold"
        label="Price per Gram"
        value={`${investment.currency} ${investment.pricePerGram?.toFixed(2) || 0}`}
      /> */}
        {/* <DetailRow
          icon="swap-horizontal"
          label="Exchange Rate"
          value={`LKR ${investmentData.exchangeRate?.toFixed(2) || 0}`}
        /> */}

        <DetailRow
          icon="clock-time-four-outline"
          label="Status"
          value={`${investmentData.status || 'N/A'}`}
        />

        <DetailRow
          icon="calendar-clock"
          label="Investment Time"
          value={formatDate(investmentData.timeToInvest)}
        />
        {investmentData.status === 'active' ? (
          <View
            style={[
              styles.profitContainer,
              profitOrLoss >= 0
                ? styles.profitBackground
                : styles.lossBackground,
            ]}>
            <Icon
              name={profitOrLoss >= 0 ? 'trending-up' : 'trending-down'}
              size={24}
              color={profitOrLoss >= 0 ? '#4CAF50' : '#F44336'}
              style={styles.profitIcon}
            />
            <Text
              style={[
                styles.profitText,
                {color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336'},
              ]}>
              {profitOrLoss >= 0 ? 'Profit' : 'Loss'}: {selectedCurrency}{' '}
              {convertCurrency(Math.abs(profitOrLoss), selectedCurrency)}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.profitContainer,
              investmentData.profitOrLossType === 'Profit'
                ? styles.profitBackground
                : styles.lossBackground,
            ]}>
            <Icon
              name={
                investmentData.profitOrLoss === 'Profit'
                  ? 'trending-up'
                  : 'trending-down'
              }
              size={24}
              color={
                investmentData.profitOrLossType === 'Profit'
                  ? '#4CAF50'
                  : '#F44336'
              }
              style={styles.profitIcon}
            />
            <Text
              style={[
                styles.profitText,
                {
                  color:
                    investmentData.profitOrLossType === 'Profit'
                      ? '#4CAF50'
                      : '#F44336',
                },
              ]}>
              {investmentData.profitOrLossType === 'Profit' ? 'Profit' : 'Loss'}
              : {selectedCurrency}{' '}
              {convertCurrency(
                Math.abs(investmentData.profit),
                selectedCurrency,
              )}
            </Text>
          </View>
        )}

        {/* <View
          style={[
            styles.profitContainer,
            profitOrLoss >= 0 ? styles.profitBackground : styles.lossBackground,
          ]}
        >
          <Icon
            name={profitOrLoss >= 0 ? 'trending-up' : 'trending-down'}
            size={24}
            color={profitOrLoss >= 0 ? '#4CAF50' : '#F44336'}
            style={styles.profitIcon}
          />
<Text
  style={[
    styles.profitText,
    { color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336' },
  ]}
>
  {profitOrLoss >= 0 ? 'Profit' : 'Loss'}: {selectedCurrency}{' '}
  {convertCurrency(Math.abs(profitOrLoss), selectedCurrency)}
</Text>
        </View> */}

        {/* <DetailRow
  icon={profitOrLoss >= 0 ? 'trending-up' : 'trending-down'}
  label={profitOrLoss >= 0 ? 'Profit' : 'Loss'}
  value={`${selectedCurrency} ${convertCurrency(Math.abs(profitOrLoss), selectedCurrency)}`}
  valueStyle={{
    color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336',
  }}
/> */}

        {investmentData && investmentData.status !== 'sold' && (
          <CustomButton title="Sell Gold" onPress={setModalVisible} />
        )}

        <CustomModal
          visible={modalVisible}
          title="Confirm sell"
          iconName="alert-circle"
          subtitle="Are you ready to proceed with this sell?"
          onConfirm={handleSellGold}
          onCancel={() => setModalVisible(false)}
          onClose={() => setModalVisible(false)}
        />
      </>
    );
  };

  const getCurrentRentDetails = () => {
    if (!posterDetails?.rents || !Array.isArray(posterDetails.rents)) {
      console.warn(
        'No rents available or rents is not an array:',
        posterDetails?.rents,
      );
      return null; // No rents available
    }

    console.log('Rents array:', posterDetails.rents);

    const now = new Date(); // Current date and time
    console.log('Current date and time:', now);

    // Sort rents by timestamp in descending order
    const sortedRents = posterDetails.rents.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
    console.log('Sorted rents by timestamp (descending):', sortedRents);

    // Find the most recent valid rent
    const currentRent = sortedRents.find(rent => {
      const rentTimestamp = new Date(rent.timestamp); // Parse the timestamp
      console.log('Checking rent:', rent);
      console.log('Parsed rent timestamp:', rentTimestamp);

      const isValid = now >= rentTimestamp; // Check if the current date is after or equal to the rent timestamp
      console.log('Is this rent valid?', isValid);

      return isValid;
    });

    if (currentRent) {
      console.log('Current rent found:', currentRent);
    } else {
      console.warn('No valid rent found for the current date.');
    }

    return currentRent || null; // Return the current rent or null if not found
  };

  const renderSolarInvestmentDetails = () => {
    if (!posterDetails) {
      return (
        <Text style={styles.loadingText}>
          Loading solar investment details...
        </Text>
      );
    }

    // Calculate the invested percentage
    const investedPercentage =
      investment.investedAmount / posterDetails.totalAmount || 0;
    const investedPercentagePercentage = investedPercentage * 100; // Convert to percentage

    // Calculate the admin commission (20% of the monthly profit)
    const adminCommission = (posterDetails.monthlyProfit || 0) * 0.2;

    // Calculate the user's share of deductions
    const userMaintenanceShare =
      (posterDetails.maintanace || 0) * investedPercentage;
    const userLandRentShare =
      (posterDetails.landRent || 0) * investedPercentage;
    const userSecurityShare =
      (posterDetails.security || 0) * investedPercentage;

    // Calculate the user's share of the monthly profit after admin commission
    const userProfitShare =
      ((posterDetails.monthlyProfit || 0) - adminCommission) *
      investedPercentage;

    // Calculate the final monthly profit after deductions
    const finalMonthlyProfit =
      userProfitShare -
      (userMaintenanceShare + userLandRentShare + userSecurityShare);

    // Calculate total profits received
    const totalProfitsReceived =
      (posterDetails.monthsCompleted || 0) * finalMonthlyProfit;

    return (
      <>
        <DetailRow
          icon="alphabetical"
          label="Solar Id"
          value={`${investment.solarId?.toLocaleString() || 'N/A'}`}
        />
        <DetailRow
          icon="currency-usd"
          label="Total Amount"
          value={`LKR ${posterDetails.totalAmount?.toLocaleString() || 'N/A'}`}
        />
        <DetailRow
          icon="solar-power"
          label="Kilowatts"
          value={`${posterDetails.kiloWatts || 0} kW`}
        />
        <DetailRow
          icon="map-marker"
          label="Location"
          value={posterDetails.location || 'N/A'}
        />
        <DetailRow
          icon="ruler-square"
          label="Land Square Feet"
          value={`${posterDetails.squarefeet || 0} sqft`}
        />
        <DetailRow
          icon="clock-time-four-outline"
          label="Status"
          value={`${posterDetails.status || 'N/A'}`}
        />

        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            marginTop: 16,
            fontSize: 16,
          }}>
          Deductions
        </Text>
        <DetailRow
          icon="wrench"
          label="Maintenance"
          value={`LKR ${userMaintenanceShare.toLocaleString()}` || 'N/A'}
        />
        <DetailRow
          icon="shield"
          label="Security"
          value={`LKR ${userSecurityShare.toLocaleString()}` || 'N/A'}
        />
        <DetailRow
          icon="home-city"
          label="Land Rent"
          value={`LKR ${userLandRentShare.toLocaleString()}` || 'N/A'}
        />

        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            marginTop: 16,
            fontSize: 16,
          }}>
          Profit Details
        </Text>
        <DetailRow
          icon="cash-multiple"
          label="Monthly Profit"
          value={`LKR ${userProfitShare.toLocaleString()}` || 'N/A'}
        />
        <DetailRow
          icon="cash-check"
          label="Final Monthly Profit"
          value={`LKR ${finalMonthlyProfit.toLocaleString()}` || 'N/A'}
        />

        <View
          style={[
            styles.profitContainer,
            profitOrLoss >= 0 ? styles.profitBackground : styles.lossBackground,
          ]}>
          <Icon
            name={profitOrLoss >= 0 ? 'trending-up' : 'trending-down'}
            size={32} // Increased icon size
            color={profitOrLoss >= 0 ? '#4CAF50' : '#F44336'}
            style={styles.profitIcon}
          />
          <Text
            style={[
              styles.profitText,
              {color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336'},
            ]}>
            {profitOrLoss >= 0 ? 'Profit' : 'Loss'}
          </Text>
          <Text
            style={[
              styles.profitValue,
              {color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336'},
            ]}>
            LKR {Math.abs(profitOrLoss).toLocaleString()}
          </Text>
        </View>
      </>
    );
  };

  const renderApartmentInvestmentDetails = () => {
    if (!posterDetails) {
      return (
        <Text style={styles.loadingText}>
          Loading apartment investment details...
        </Text>
      );
    }

    // Get the current rent details
    const currentRent = getCurrentRentDetails();

    // Calculate profit or loss
    const profitOrLoss = investment.profit || 0;

    return (
      <>
        <DetailRow
          icon="calendar-clock"
          label="Investment Time"
          value={formatDate(investment.time)}
        />
        <DetailRow
          icon="currency-usd"
          label="Total Amount"
          value={`${selectedCurrency} ${convertCurrency(
            posterDetails.totalAmount || 0,
            selectedCurrency,
          )}`}
        />
        <DetailRow
          icon="map-marker"
          label="Location"
          value={posterDetails.location || 'N/A'}
        />
        <DetailRow
          icon="ruler-square"
          label="Square Feet"
          value={`${posterDetails.squarefeet || 0} sqft`}
        />
        <DetailRow
          icon="clock-time-four-outline"
          label="Status"
          value={`${posterDetails.status || 'N/A'}`}
        />

        {/* Profit Section */}
        <View
          style={[
            styles.profitContainer,
            profitOrLoss >= 0 ? styles.profitBackground : styles.lossBackground,
          ]}>
          <Icon
            name={profitOrLoss >= 0 ? 'trending-up' : 'trending-down'}
            size={32}
            color={profitOrLoss >= 0 ? '#4CAF50' : '#F44336'}
            style={styles.profitIcon}
          />
          <Text
            style={[
              styles.profitText,
              {color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336'},
            ]}>
            {profitOrLoss >= 0 ? 'Profit' : 'Loss'}
          </Text>
          <Text
            style={[
              styles.profitValue,
              {color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336'},
            ]}>
            {selectedCurrency}{' '}
            {convertCurrency(Math.abs(profitOrLoss), selectedCurrency)}
          </Text>
        </View>

        {posterDetails.status === 'in rent' && (
          <>
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                marginTop: 16,
                fontSize: 16,
              }}>
              Rent Details
            </Text>
            {currentRent ? (
              <>
                <DetailRow
                  icon="cash"
                  label="Rent Amount"
                  value={`${selectedCurrency} ${convertCurrency(
                    currentRent.rentAmount || 0,
                    selectedCurrency,
                  )}`}
                />
                <DetailRow
                  icon="calendar-clock"
                  label="Rent Duration"
                  value={`${currentRent.rentDuration || 'N/A'} months`}
                />
                <DetailRow
                  icon="calendar-clock"
                  label="Rent Start Date"
                  value={currentRent.rentStartingDate}
                />
                <DetailRow
                  icon="calendar-clock"
                  label="Rent End Date"
                  value={currentRent.rentEndingDate}
                />
              </>
            ) : (
              <Text style={{color: 'gray', marginTop: 8}}>
                No active rent details available.
              </Text>
            )}
          </>
        )}
      </>
    );
  };

  const handleSellStock = async () => {
    setModalVisible(false); // Close the modal
    setLoading(true); // Start loading
    try {
      const userId = auth.currentUser.uid;
      if (!userId) {
        console.warn('User not logged in!');
        setLoading(false); // Stop loading
        return;
      }

      console.log('User ID:', userId);

      // Reference to the user's stock investment document
      const stockInvestmentRef = doc(
        collection(db, 'users', userId, 'stockInvestments'),
        investment.id,
      );

      console.log('Stock Investment ID:', investment.id);

      // Calculate profit or loss
      const status = profitOrLoss >= 0 ? 'Profit' : 'Loss';
      const profitOrLossValue = Math.abs(profitOrLoss);

      console.log('Profit or Loss Value:', profitOrLossValue);
      console.log('Status:', status);

      const updateFields =
        profitOrLoss >= 0
          ? {profit: profitOrLossValue, loss: 0} // Profit scenario
          : {profit: 0, loss: profitOrLossValue}; // Loss scenario

      // Update the stock investment document with status and profit/loss
      await updateDoc(stockInvestmentRef, {
        investedAmount: investment.investedAmount,
        status: 'sold',
        ...updateFields, // Spread the calculated profit/loss fields
        profitOrLoss: profitOrLossValue,
        profitOrLossType: status,
        soldAt: serverTimestamp(), // Add timestamp for when it was sold
      });

      console.log('Stock investment status updated to: sold');

      // Update totalAssets collection
      const totalAssetsRef = collection(db, 'users', userId, 'totalAssets');

      // Add the sold amount to cash
      const cashDocRef = doc(totalAssetsRef, 'cash');
      const cashSnapshot = await getDoc(cashDocRef);
      const currentValue = investment.stockCount * currentStockPrice; // Calculate the current value of the stock investment
      if (cashSnapshot.exists()) {
        const currentCash = parseFloat(cashSnapshot.data().amount) || 0;
        const newCashAmount = currentCash + currentValue; // Add the current value of the stock investment
        console.log('Current Cash:', currentCash);
        console.log('Updated Cash:', newCashAmount);
        await updateDoc(cashDocRef, {amount: newCashAmount});
        console.log('Cash updated successfully:', newCashAmount);
      } else {
        console.warn('Cash document not found! Creating a new one.');
        await setDoc(cashDocRef, {amount: currentValue});
        console.log('New Cash document created:', currentValue);
      }

      // Deduct the sold amount from stockInvestments
      const stockInvestmentsDocRef = doc(totalAssetsRef, 'stockInvestments');
      const stockInvestmentsSnapshot = await getDoc(stockInvestmentsDocRef);
      if (stockInvestmentsSnapshot.exists()) {
        const currentStockInvestment =
          parseFloat(stockInvestmentsSnapshot.data().amount) || 0;
        const newStockInvestmentAmount =
          currentStockInvestment - investment.investedAmount; // Deduct the invested value
        console.log('Current Stock Investment:', currentStockInvestment);
        console.log('Updated Stock Investment:', newStockInvestmentAmount);
        await updateDoc(stockInvestmentsDocRef, {
          amount: newStockInvestmentAmount,
        });
        console.log(
          'Stock investments updated successfully:',
          newStockInvestmentAmount,
        );
      } else {
        console.warn('Stock investments document not found!');
      }

      console.log('Stock investment sold successfully.');

      const dashboardRef = doc(db, 'DashboardData', 'Profits');
      const dashboardSnapshot = await getDoc(dashboardRef);

      let totalProfit = 0;
      let stockProfit = 0;

      if (dashboardSnapshot.exists()) {
        const data = dashboardSnapshot.data();
        totalProfit = parseFloat(data.TotalProfit) || 0;
        goldProfit = parseFloat(data.Stock) || 0;

        const newProfit =
          status === 'Profit' ? profitOrLossValue : -profitOrLossValue; // Subtract if loss

        const updatedData = {
          TotalProfit: totalProfit + newProfit,
          Stock: stockProfit + newProfit,
        };

        await updateDoc(dashboardRef, updatedData);
        console.log('Dashboard profit summary updated successfully.');
      } else {
        const newProfit =
          status === 'Profit' ? profitOrLossValue : -profitOrLossValue;

        const newData = {
          TotalProfit: newProfit,
          Stock: newProfit,
        };

        await setDoc(dashboardRef, newData);
        console.log('Dashboard profit summary created successfully.');
      }

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Error selling stock:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const formatDateTime = isoString => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
      hour12: true,
    });
  };

  const renderStockInvestmentDetails = () => {
    if (!investmentData) {
      return (
        <Text style={styles.loadingText}>
          Loading stock investment details...
        </Text>
      );
    }
    return (
      <>
        <DetailRow
          icon="currency-usd"
          label="Invested Amount"
          value={`LKR ${investment.investedAmount?.toLocaleString() || 0}`}
        />
        <DetailRow
          icon="domain"
          label="Company Name"
          value={`${investment.stockSymbol || 'N/A'}`}
        />
        <DetailRow
          icon="chart-bar"
          label="Stock Count"
          value={`${investment.stockCount || 0} stocks`}
        />
        <DetailRow
          icon="cash-multiple"
          label="Price per Stock"
          value={`LKR ${investment.stockPrice?.toLocaleString() || 0}`}
        />
        <DetailRow
          icon="calendar"
          label="Investment Time"
          value={formatDateTime(investment.purchasedAt)}
        />

        {/* Profit/Loss Section */}

        {investmentData.status === 'active' ? (
          <View
            style={[
              styles.profitContainer,
              profitOrLoss >= 0
                ? styles.profitBackground
                : styles.lossBackground,
            ]}>
            <Icon
              name={profitOrLoss >= 0 ? 'trending-up' : 'trending-down'}
              size={24}
              color={profitOrLoss >= 0 ? '#4CAF50' : '#F44336'}
              style={styles.profitIcon}
            />
            <Text
              style={[
                styles.profitText,
                {color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336'},
              ]}>
              {profitOrLoss >= 0 ? 'Profit' : 'Loss'}: {selectedCurrency}{' '}
              {convertCurrency(Math.abs(profitOrLoss), selectedCurrency)}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.profitContainer,
              investmentData.profitOrLossType === 'Profit'
                ? styles.profitBackground
                : styles.lossBackground,
            ]}>
            <Icon
              name={
                investmentData.profitOrLoss === 'Profit'
                  ? 'trending-up'
                  : 'trending-down'
              }
              size={24}
              color={
                investmentData.profitOrLossType === 'Profit'
                  ? '#4CAF50'
                  : '#F44336'
              }
              style={styles.profitIcon}
            />
            <Text
              style={[
                styles.profitText,
                {
                  color:
                    investmentData.profitOrLossType === 'Profit'
                      ? '#4CAF50'
                      : '#F44336',
                },
              ]}>
              {investmentData.profitOrLossType === 'Profit' ? 'Profit' : 'Loss'}
              : {selectedCurrency}{' '}
              {convertCurrency(
                Math.abs(investmentData.profit),
                selectedCurrency,
              )}
            </Text>
          </View>
        )}

        {/* <View
          style={[
            styles.profitContainer,
            profitOrLoss >= 0 ? styles.profitBackground : styles.lossBackground,
          ]}>
          <Icon
            name={profitOrLoss >= 0 ? 'trending-up' : 'trending-down'}
            size={24}
            color={profitOrLoss >= 0 ? '#4CAF50' : '#F44336'}
            style={styles.profitIcon}
          />
          <Text
            style={[
              styles.profitText,
              {color: profitOrLoss >= 0 ? '#4CAF50' : '#F44336'},
            ]}>
            {profitOrLoss >= 0 ? 'Profit' : 'Loss'}: LKR{' '}
            {Math.abs(profitOrLoss).toLocaleString()}
          </Text>
        </View> */}

        {investmentData && investmentData.status !== 'sold' && (
          <CustomButton title="Sell Stock" onPress={setModalVisible} />
        )}

        <CustomModal
          visible={modalVisible}
          title="Confirm sell"
          iconName="alert-circle"
          subtitle="Are you ready to proceed with this sell?"
          onConfirm={handleSellStock}
          onCancel={() => setModalVisible(false)}
          onClose={() => setModalVisible(false)}
        />
      </>
    );
  };

  const DetailRow = ({icon, label, value}) => (
    <View style={styles.detailRow}>
      <View style={styles.labelContainer}>
        <Icon
          name={icon}
          size={20}
          color={Colours.primaryColour}
          style={styles.icon}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
  const renderInvestmentSpecificDetails = () => {
    switch (type) {
      case 'goldInvestments':
        return renderGoldInvestmentDetails();
      case 'solarInvestments':
        return renderSolarInvestmentDetails();
      case 'apartmentInvestments':
        return renderApartmentInvestmentDetails();
      case 'stockInvestments':
        return renderStockInvestmentDetails();
      default:
        return null;
    }
  };

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'collecting funds':
        return '#FFC107';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleNextImage = () => {
    if (
      posterDetails.workImages &&
      currentImageIndex < posterDetails.workImages.length - 1
    ) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (posterDetails.workImages && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Icon
                name={getInvestmentIcon()}
                size={28}
                color={Colours.primaryColour}
                style={styles.titleIcon}
              />
              <Text style={styles.headerTitle}>{getInvestmentTypeTitle()}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>ID: {investment.id}</Text>
        </View>

        <View style={styles.card}>
          <DetailRow
            icon="cash"
            label="Invested Amount"
            value={`LKR ${investment.investedAmount?.toLocaleString() || 0}`}
          />
          {renderInvestmentSpecificDetails()}
        </View>
        {posterDetails && posterDetails.status !== 'collecting funds' && (
          <TouchableOpacity style={styles.actionButton} onPress={openModal}>
            <Icon
              name="image"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>View workImages</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <Icon2 name="close-circle" size={32} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{posterDetails?.title}</Text>

            {posterDetails?.workImages?.length > 0 && (
              <View style={styles.imageContainer}>
                <Text style={styles.imageCounter}>
                  Work Images ({currentImageIndex + 1}/
                  {posterDetails.workImages.length})
                </Text>

                <Image
                  source={{uri: posterDetails.workImages[currentImageIndex]}}
                  style={styles.image}
                  resizeMode="cover"
                />

                <View style={styles.imageNavigation}>
                  <TouchableOpacity
                    onPress={() => {
                      if (currentImageIndex > 0)
                        setCurrentImageIndex(currentImageIndex - 1);
                    }}
                    disabled={currentImageIndex === 0}
                    style={styles.navButton}>
                    <Icon2
                      name="arrow-back-circle"
                      size={32}
                      color={currentImageIndex === 0 ? '#ccc' : '#333'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (
                        currentImageIndex <
                        posterDetails.workImages.length - 1
                      )
                        setCurrentImageIndex(currentImageIndex + 1);
                    }}
                    disabled={
                      currentImageIndex === posterDetails.workImages.length - 1
                    }
                    style={styles.navButton}>
                    <Icon2
                      name="arrow-forward-circle"
                      size={32}
                      color={
                        currentImageIndex ===
                        posterDetails.workImages.length - 1
                          ? '#ccc'
                          : '#333'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    header: {
      padding: 20,
      backgroundColor: Colors[theme].subHeader,
      borderBottomWidth: 1,
      borderBottomColor: '#E1E4E8',
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleIcon: {
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors[theme].textColor,
    },
    headerSubtitle: {
      fontSize: 14,
      color: Colors[theme].gray,
      marginTop: 8,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      marginTop: 16,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    card: {
      margin: 16,
      padding: 20,
      backgroundColor: Colors[theme].subHeader,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },

    profitContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      marginVertical: 16,
    },
    profitBackground: {
      backgroundColor: '#E8F5E9', // Light green for profit
    },
    lossBackground: {
      backgroundColor: '#FFEBEE', // Light red for loss
    },
    profitIcon: {
      marginRight: 8,
    },
    profitText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginRight: 8,
    },
    label: {
      fontSize: 15,
      color: Colors[theme].gray,
      fontWeight: 'bold',
    },
    value: {
      fontSize: 15,
      color: Colors[theme].textColor,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'right',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colours.primaryColour,
      margin: 16,
      padding: 16,
      borderRadius: 12,
      shadowColor: Colours.primaryColour,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonIcon: {
      marginRight: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0,)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      width: '90%',
      alignItems: 'center',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
      textAlign: 'center',
    },
    imageContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    imageCounter: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
      color: '#333',
    },
    image: {
      width: 250,
      height: 180,
      borderRadius: 10,
      backgroundColor: '#ccc',
    },
    imageNavigation: {
      flexDirection: 'row',
      marginTop: 15,
      justifyContent: 'space-between',
      width: '60%',
    },
    navButton: {
      padding: 10,
    },
    profitContainer: {
      flexDirection: 'row', // Changed to column for better alignment
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: 6,
      borderRadius: 12,
      marginVertical: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    profitBackground: {
      backgroundColor: '#E8F5E9', // Light green for profit
      borderWidth: 1,
      borderColor: '#4CAF50',
    },
    lossBackground: {
      backgroundColor: '#FFEBEE', // Light red for loss
      borderWidth: 1,
      borderColor: '#F44336',
    },
    profitIcon: {
      marginBottom: 8,
    },
    profitText: {
      fontSize: 20, // Increased font size
      fontWeight: 'bold',
      marginBottom: 4,
    },
    profitValue: {
      fontSize: 24, // Larger font size for the value
      fontWeight: 'bold',
    },
  });

export default InvestmentDetailsScreen;
