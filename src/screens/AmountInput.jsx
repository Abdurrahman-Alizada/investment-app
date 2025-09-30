import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import Header from '../components/Header';
import {Colours, height} from '../../constants/Details';
import CustomHeaderText from '../components/CustomHeaderText';
import CustomButton from '../components/CustomButtom';
import CustomModal from '../components/CustomModal';
import toast from '../../helpers/toast';
import {auth, db} from '../utils/firebase';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import SuccessModal from '../components/SuccessModal';

import {
  BannerAd,
  BannerAdSize,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import {bannerAdId, rewardedAdId} from '../ads/adsConfig'; // Adjust the import path as necessary
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';

const AmountInput = ({navigation, route}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [amount, setAmount] = useState('0.00');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRewardedAdLoaded, setIsRewardedAdLoaded] = useState(false);
  const [firstFocus, setFirstFocus] = useState(true);
  const [selection, setSelection] = useState(undefined);

  // Extract details from route params
  const {fromScreen, id, solarDetails} = route.params;
  const {totalAmount, monthlyProfit} = solarDetails;
  const modalSubTitle = `Are you sure you want to invest LKR.${amount.toLocaleString()}?`;

  useEffect(() => {
    initReward();
  }, []);

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
  // Format the amount
  const formatAmount = value => {
    let numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    return numericValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = text => {
    setAmount(formatAmount(text));
  };

  const handleContinue = () => {
    if (
      investmentAmount > 0 &&
      investmentAmount <= parseFloat(solarDetails.investableAmount)
    ) {
      setModalVisible(true);
    } else {
      toast.info({message: 'Invalid amount. Enter a valid investment amount.'});
    }
  };

  const adForInvestment = async () => {
    try {
      setModalVisible(false); // Hide the confirmation modal
      setLoading(true); // Show the loader

      const user = auth.currentUser;
      if (!user) {
        console.warn('User not logged in!');
        setLoading(false); // Hide the loader
        return;
      }

      const userId = user.uid;
      console.log('User ID:', userId);

      const investmentAmount = parseFloat(amount.replace(/,/g, '')); // Ensure amount is a valid number
      console.log('Investment Amount:', investmentAmount);

      if (isNaN(investmentAmount) || investmentAmount <= 0) {
        console.warn('Invalid investment amount!');
        setLoading(false); // Hide the loader
        return;
      }

      // Fetch user's cash amount
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
      if (investmentAmount > currentCash) {
        console.warn('Investment amount exceeds available cash!');
        toast.info({
          message: 'Insufficient cash. Please adjust your investment amount.',
        });
        setLoading(false); // Hide the loader
        return;
      }

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
          await handleConfirm(); // Separate function for reward processing
        },
      );
    } catch (error) {
      console.error('Error processing investment:', error);
      toast.error({
        message: 'An error occurred while processing your investment.',
      });
      setLoading(false); // Hide the loader in case of error
    }
  };

  const handleConfirm = async () => {
    try {
      const userId = auth.currentUser.uid;
      const collectionRef =
        fromScreen === 'solar' ? 'solarInvestments' : 'apartmentInvestments';

      // 1. Check if already invested in this solar/apartment plan
      const investmentsColRef = collection(db, 'users', userId, collectionRef);
      const q =
        fromScreen === 'solar'
          ? query(investmentsColRef, where('solarId', '==', solarDetails.id))
          : query(
              investmentsColRef,
              where('apartmentId', '==', solarDetails.id),
            );
      const existingSnap = await getDocs(q);

      let investmentRef;
      let prevAmount = 0;

      if (!existingSnap.empty) {
        // Already invested, update the same doc
        investmentRef = existingSnap.docs[0].ref;
        prevAmount =
          parseFloat(existingSnap.docs[0].data().investedAmount) || 0;
      } else {
        // Not invested yet, create new doc
        const investmentId = doc(collection(db, 'random')).id;
        investmentRef = doc(investmentsColRef, investmentId);
      }

      // Poster reference
      const docidForPoster =
        fromScreen === 'apartment'
          ? 'VrT66Kjql1FZpiKwKeG3'
          : 'BpXWNAOoq7fVubDc77cJ';
      const collectionRefPoster =
        fromScreen === 'solar' ? 'solarPosters' : 'apartmentPosters';

      const solarRef = doc(
        collection(
          db,
          'investmentPosters',
          docidForPoster,
          collectionRefPoster,
        ),
        solarDetails.id,
      );

      // Fetch current solar/apartment data
      const solarSnapshot = await getDoc(solarRef);
      if (!solarSnapshot.exists()) {
        console.warn('Poster not found!');
        setLoading(false);
        return;
      }

      const solarData = solarSnapshot.data();
      const currentInvestableAmount =
        parseFloat(solarData.investableAmount) || 0;

      if (investmentAmount > currentInvestableAmount) {
        toast.info({
          message: 'Investment amount exceeds available investable amount.',
        });
        setLoading(false);
        return;
      }

      const newInvestableAmount = currentInvestableAmount - investmentAmount;

      // Step 1: Add or update investment details for the user
      if (fromScreen === 'solar') {
        await setDoc(
          investmentRef,
          {
            solarId: solarDetails.id,
            investedAmount: prevAmount + investmentAmount,
            time: serverTimestamp(),
            profitShare: profitShare,
          },
          {merge: true},
        );
      } else {
        await setDoc(
          investmentRef,
          {
            apartmentId: solarDetails.id,
            investedAmount: prevAmount + investmentAmount,
            time: serverTimestamp(),
          },
          {merge: true},
        );
      }

      // Step 2: Update investable amount and status in the poster
      await updateDoc(solarRef, {
        investableAmount: newInvestableAmount,
        investable: newInvestableAmount > 0,
        investers: arrayUnion(userId),
      });

      // Step 3: Update totalAssets collection
      const totalAssetsRef = collection(db, 'users', userId, 'totalAssets');
      const cashDocRef = doc(totalAssetsRef, 'cash');
      const cashSnapshot = await getDoc(cashDocRef);
      let currentCash = 0;
      if (cashSnapshot.exists()) {
        currentCash = parseFloat(cashSnapshot.data().amount) || 0;
      }
      const newCashAmount = currentCash - investmentAmount;
      await updateDoc(cashDocRef, {amount: newCashAmount});

      // Step 4: Add to investment plan
      const investmentPlanDocRef = doc(totalAssetsRef, collectionRef);
      const investmentPlanSnapshot = await getDoc(investmentPlanDocRef);
      if (investmentPlanSnapshot.exists()) {
        const currentInvestment =
          parseFloat(investmentPlanSnapshot.data().amount) || 0;
        const newInvestmentAmount = currentInvestment + investmentAmount;
        await updateDoc(investmentPlanDocRef, {amount: newInvestmentAmount});
      } else {
        await setDoc(investmentPlanDocRef, {amount: investmentAmount});
      }

      // Step 5: Update dashboardData/investments/{solarInvestments | apartmentInvestments}
      // Step 5: Update DashboardData/Investments (as fields inside the Investments document)
      const investmentsDocRef = doc(db, 'DashboardData', 'Investments');

      const fieldKey =
        fromScreen === 'solar' ? 'SolarInvestment' : 'ApartmentInvestment';

      const investmentsDocSnap = await getDoc(investmentsDocRef);

      if (investmentsDocSnap.exists()) {
        const existingAmount =
          parseFloat(investmentsDocSnap.data()[fieldKey]) || 0;
        const newAmount = existingAmount + investmentAmount;

        await updateDoc(investmentsDocRef, {
          [fieldKey]: newAmount,
        });
      } else {
        // If the document doesn't exist, create it with the first investment
        await setDoc(investmentsDocRef, {
          [fieldKey]: investmentAmount,
        });
      }

      setLoading(false);
      setModalSuccessVisible(true);
    } catch (error) {
      console.error('Error making investment:', error);
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (firstFocus) {
      setSelection({start: 0, end: 0}); // cursor front-ல்
      setFirstFocus(false); // அடுத்த முறைகள் இயல்பாக cursor நகரும்
    }
  };

  const handleSelectionChange = () => {
    // once user moves cursor or types, remove forced selection
    if (selection) setSelection(undefined);
  };

  // Calculate investment percentage and estimated profit
  const investmentAmount = parseFloat(amount.replace(/,/g, '')) || 0; // Ensure amount is a valid number
  const totalAmountParsed = parseFloat(totalAmount) || 1; // Avoid division by zero
  const monthlyProfitParsed = parseFloat(monthlyProfit) || 0; // Ensure monthlyProfit is a valid number

  const profitShare =
    (investmentAmount / totalAmountParsed) * monthlyProfitParsed;

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
    <SafeAreaView
      style={{
        flex: 1,
        width: '100%',
        backgroundColor: Colors[theme].background,
      }}>
      <Header navigation={navigation} />
      <View
        style={{
          width: '100%',
          height: height * 0.91,
          padding: 20,
          backgroundColor: Colors[theme].background,
        }}>
        <CustomHeaderText
          title={`Enter the amount to invest in ${fromScreen} investment`}
        />
        <Text style={{color: Colors[theme].textColor}}>
          Investable amount is {solarDetails.investableAmount.toLocaleString()}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            onFocus={handleInputFocus}
            selection={selection}
            onSelectionChange={handleSelectionChange}
          />
        </View>

        {fromScreen === 'solar' && investmentAmount > 0 && (
          <Text style={styles.profitText}>
            Approximate Monthly Profit: {profitShare.toFixed(2)}
          </Text>
        )}
        <View>
          <CustomButton title="Continue" onPress={handleContinue} />
        </View>
      </View>
      <View>
        <CustomModal
          visible={modalVisible}
          title="Confirmation"
          iconName="alert-circle-outline"
          subtitle={modalSubTitle}
          onCancel={() => setModalVisible(false)}
          onConfirm={adForInvestment}
        />

        <SuccessModal
          visible={modalSuccessVisible}
          title="Success!"
          subtitle="Your action was completed successfully."
          // onConfirm={() => navigation.navigate('Tabs', {screen: 'Portfolio'})}
          onConfirm={handleConfirmPress}
          type="success"
        />
      </View>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    inputContainer: {
      width: '100%',
      height: height * 0.2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      borderBottomColor: Colors[theme].gray,
      borderBottomWidth: 0.5,
      width: '80%',
      color: Colors[theme].textColor,
      fontWeight: '900',
      fontSize: 50,
      textAlign: 'center',
    },
    profitText: {
      textAlign: 'center',
      fontSize: 18,
      color: 'green',
      marginTop: 10,
      fontWeight: 'bold',
    },
  });

export default AmountInput;
