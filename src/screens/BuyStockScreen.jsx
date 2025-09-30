import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Colours} from '../../constants/Details';
import {doc, setDoc, getDoc, collection, updateDoc} from 'firebase/firestore';
import {auth, db} from '../utils/firebase';
import CustomButton from '../components/CustomButtom';
import CustomModal from '../components/CustomModal';
import SuccessModal from '../components/SuccessModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import {
  BannerAd,
  BannerAdSize,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import {bannerAdId, rewardedAdId} from '../ads/adsConfig'; // Import the banner ad ID
import LoaderAnim from '../components/Loader';

// import { Colours } from '../../constants/Details';

const BuyStockScreen = ({route, navigation}) => {
  const {stock} = route.params;
  const stockPrice = parseFloat(stock.price) || 0; // Ensure stock.price is a valid number
  const [stockCount, setStockCount] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const [isRewardedAdLoaded, setIsRewardedAdLoaded] = useState(false);

  useEffect(() => {
    initReward();
  });

  const initReward = async () => {
    const rewardedAd = RewardedAd.createForAdRequest(rewardedAdId);
    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsRewardedAdLoaded(rewardedAd);
      // console.log('rewarded ad loaded');
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      // console.log('User earned reward of ', reward);
      handleBonusReward();
      // Handle the reward here, e.g., update user balance
    });

    rewardedAd.load();
  };

  const handleStockCountChange = count => {
    if (count === '') {
      setStockCount('');
      setTotalPrice(0);
      setError('');
      return;
    }

    const numericCount = parseInt(count);
    if (isNaN(numericCount) || numericCount < 0) {
      setError('Please enter a valid number');
      return;
    }

    setStockCount(count);
    setTotalPrice(numericCount * stockPrice); // Use the validated stockPrice
    setError('');
  };

  const validatePurchase = () => {
    if (!stockCount || parseInt(stockCount) <= 0) {
      setError('Please enter a valid number of stocks');
      return false;
    }
    return true;
  };

  const handleConfirmPurchase = async () => {
    if (!validatePurchase()) return;
    setShowConfirmModal(true);
  };

  const adReward = () => {
    setShowConfirmModal(false);
    setLoading(true);
    if (!isRewardedAdLoaded) {
      Alert.alert('Ad Not Ready', 'Please wait for the ad to load.');
      setLoading(false);
      return;
    }

    // Remove any existing listeners first
    isRewardedAdLoaded.removeAllListeners();

    isRewardedAdLoaded.show();
    isRewardedAdLoaded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async () => {
        console.log('User earned reward from daily claim');
        await processPurchase(); // Separate function for reward processing
      },
    );

    try {
    } catch (error) {}
  };

  const processPurchase = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      if (!userId) {
        setError('User not logged in!');
        setLoading(false);
        return;
      }

      // Reference to the user's stock investment document
      const investmentRef = doc(
        db,
        `users/${userId}/stockInvestments`,
        stock.id,
      );

      // Save the stock investment
      await setDoc(investmentRef, {
        stockId: stock.id,
        stockName: stock.name,
        stockSymbol: stock.symbol,
        stockPrice: stockPrice, // Use the validated stockPrice
        stockCount: parseInt(stockCount),
        investedAmount: totalPrice,
        purchasedAt: new Date().toISOString(),
        status: 'active',
      });

      console.log('Stock investment saved successfully.');

      // Update totalAssets collection
      const totalAssetsRef = collection(db, `users/${userId}/totalAssets`);

      // Deduct the invested amount from cash
      const cashDocRef = doc(totalAssetsRef, 'cash');
      const cashSnapshot = await getDoc(cashDocRef);
      if (cashSnapshot.exists()) {
        const currentCash = parseFloat(cashSnapshot.data().amount) || 0;
        const newCashAmount = currentCash - totalPrice; // Deduct the invested amount
        console.log('Current Cash:', currentCash);
        console.log('Updated Cash:', newCashAmount);
        await setDoc(cashDocRef, {amount: newCashAmount}, {merge: true});
        console.log('Cash updated successfully:', newCashAmount);
      } else {
        console.warn('Cash document not found! Creating a new one.');
        await setDoc(cashDocRef, {amount: -totalPrice});
        console.log('New Cash document created:', -totalPrice);
      }

      // Add the invested amount to stockInvestments
      const stockInvestmentsDocRef = doc(totalAssetsRef, 'stockInvestments');
      const stockInvestmentsSnapshot = await getDoc(stockInvestmentsDocRef);
      if (stockInvestmentsSnapshot.exists()) {
        const currentStockInvestment =
          parseFloat(stockInvestmentsSnapshot.data().amount) || 0;
        const newStockInvestmentAmount = currentStockInvestment + totalPrice; // Add the invested amount
        console.log('Current Stock Investment:', currentStockInvestment);
        console.log('Updated Stock Investment:', newStockInvestmentAmount);
        await setDoc(
          stockInvestmentsDocRef,
          {amount: newStockInvestmentAmount},
          {merge: true},
        );
        console.log(
          'Stock investments updated successfully:',
          newStockInvestmentAmount,
        );
      } else {
        console.warn(
          'Stock investments document not found! Creating a new one.',
        );
        await setDoc(stockInvestmentsDocRef, {amount: totalPrice});
        console.log('New Stock Investments document created:', totalPrice);
      }

      // Step 6: Update DashboardDataCollection/InvestmentsDocID
      const dashboardRef = doc(db, 'DashboardData', 'Investments');
      const dashboardSnapshot = await getDoc(dashboardRef);

      let total = 0;
      let stocks = 0;

      if (dashboardSnapshot.exists()) {
        const data = dashboardSnapshot.data();
        total = parseFloat(data.TotalInvestment) || 0;

        const updatedData = {
          TotalInvestment: total + totalPrice,
          StockInvestment: stocks + totalPrice,
        };

        await updateDoc(dashboardRef, updatedData);
        console.log('Dashboard investment summary updated successfully.');
      } else {
        // Document doesn't exist, create a new one
        const newData = {
          TotalInvestment: totalPrice,
          StockInvestment: totalPrice,
        };

        await setDoc(dashboardRef, newData);
        console.log('Dashboard investment summary created successfully.');
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving investment:', error);
      setError('Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPress = () => {
    setShowSuccessModal(false);

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="chart-line" size={40} color={Colours.primary} />
          <Text style={styles.title}>{stock.name}</Text>
          <Text style={styles.symbol}>{stock.symbol}</Text>
        </View>

        <View style={styles.priceCard}>
          <View style={styles.gradientCard}>
            <Text style={styles.priceLabel}>Current Stock Price</Text>
            <Text style={styles.priceValue}>LKR {stockPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Number of Stocks</Text>
          <View style={styles.inputContainer}>
            <Icon
              name="numeric"
              size={24}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
              value={stockCount}
              onChangeText={handleStockCountChange}
              placeholderTextColor="#999"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.summaryCard}>
          <View
            //  colors={['#ffffff', '#f8f9fa']}
            style={styles.gradientCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Investment</Text>
              <Text style={styles.summaryValue}>
                LKR {totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPurchase}
          disabled={!stockCount || parseInt(stockCount) <= 0}>
          <View
            //  colors={[Colours.primaryColour, '#4a90e2']}
            style={styles.gradientButton}>
            <Icon name="cart" size={24} color="white" />
            <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <CustomModal
        visible={showConfirmModal}
        title="Confirm Purchase"
        iconName="cart-check"
        subtitle={`Are you sure you want to purchase ${stockCount} shares of ${
          stock.symbol
        } for LKR ${totalPrice.toFixed(2)}?`}
        onConfirm={adReward}
        onCancel={() => setShowConfirmModal(false)}
        onClose={() => setShowConfirmModal(false)}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="Purchase Successful"
        iconName="check-circle"
        subtitle={`You have successfully purchased ${stockCount} shares of ${stock.symbol}`}
        onConfirm={handleConfirmPress}
      />

      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.backgroundColour,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 4,
  },
  symbol: {
    fontSize: 16,
    color: '#666',
  },
  priceCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientCard: {
    padding: 16,
    backgroundColor: '#fff',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colours.primary,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  summaryCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 8,
    backgroundColor: Colours.primaryColour,
    borderRadius: 26,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BuyStockScreen;
