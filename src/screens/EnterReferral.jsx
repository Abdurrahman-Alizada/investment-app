import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
  Modal,
  Image,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import React, {useState} from 'react';
import {Colours} from '../../constants/Details';
import Header from '../components/Header';
import CustomHeaderText from '../components/CustomHeaderText';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom'; // Assuming you have a CustomButton component
import {
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {db, auth} from '../utils/firebase';
import LoaderAnim from '../components/Loader';
import {Colors} from '../../constants/Colors';
import {sendNotification} from '../utils/sendNotification';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig';

// import auth from '@react-native-firebase/auth'

const EnterReferral = ({navigation, route}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [referralCode, setReferralCode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [promoCode, setPromoCode] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  //   const {currentUser} = route.params

  const handleReferralSubmit = async () => {
    if (!referralCode) {
      Alert.alert('Error', 'Please enter a referral code.');
      return;
    }

    setIsLoading(true);
    console.log('🔁 Submitting referral code:', referralCode);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      const currentUserId = currentUser.uid;
      const currentUserDocRef = doc(db, 'users', currentUserId);
      const currentUserDocSnap = await getDoc(currentUserDocRef);

      if (!currentUserDocSnap.exists()) {
        Alert.alert('Error', 'User data not found.');
        return;
      }

      const currentUserData = currentUserDocSnap.data();
      const currentUserReferralCode = currentUserData.referralCode;

      console.log('🔍 Current user referral code:', currentUserReferralCode);

      if (referralCode === currentUserReferralCode) {
        Alert.alert('Error', 'You cannot use your own referral code.');
        return;
      }

      // ✅ Check in customReferral document
      const promoDocRef = doc(db, 'others', 'customReferral');
      const promoDocSnap = await getDoc(promoDocRef);

      if (promoDocSnap.exists()) {
        const promoData = promoDocSnap.data();
        console.log('📜 Promo data:', promoData);
        const promoEntry = promoData[referralCode];

        console.log('🎯 Custom promo check:', promoEntry);

        if (promoEntry) {
          const amount = promoEntry.amount || 0;

          const currentUserCashDocRef = doc(
            db,
            'users',
            currentUserId,
            'totalAssets',
            'cash',
          );

          await setDoc(
            currentUserCashDocRef,
            {amount: increment(amount)},
            {merge: true},
          );

          await updateDoc(currentUserDocRef, {
            referredByPromo: true,
            usedPromoCode: referralCode,
          });

          console.log(
            `✅ Promo code applied: ${referralCode} | Amount: ${amount}`,
          );
          setPromoCode(promoEntry);
          setIsModalVisible(true);
          // navigation.replace('Drawer');
          return;
        }
      }

      // 🔁 If not a promo code, check user referral logic
      const referrerCustomID = referralCode.slice(0, -3); // Adjust based on your ID format
      console.log('🔍 Searching for user with customID:', referrerCustomID);

      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(
        query(usersRef, where('customID', '==', referrerCustomID)),
      );

      if (querySnapshot.empty) {
        Alert.alert('Invalid Referral', 'The referral code is invalid.');
        return;
      }

      const referrerUserId = querySnapshot.docs[0].id;
      const referrerDocRef = doc(db, 'users', referrerUserId);
      const referrerCashDocRef = doc(
        db,
        'users',
        referrerUserId,
        'totalAssets',
        'cash',
      );

      const currentUserCashDocRef = doc(
        db,
        'users',
        currentUserId,
        'totalAssets',
        'cash',
      );

      await setDoc(
        currentUserCashDocRef,
        {amount: increment(50000)},
        {merge: true},
      );

      await updateDoc(currentUserDocRef, {
        referreleByOtherUser: true,
        referredBy: referrerUserId,
      });

      await updateDoc(referrerDocRef, {
        referredUsers: arrayUnion(currentUserId),
      });

      console.log(
        '🎉 Referral by user successful. Referrer ID:',
        referrerUserId,
      );

      const referrerDocSnap = await getDoc(referrerDocRef);
      const referrerData = referrerDocSnap.data();
      const referrerPlayerId = referrerData?.playerId; // Make sure this field exists

      if (referrerPlayerId) {
        await sendNotification({
          playerId: referrerPlayerId,
          heading: 'Referral Success!',
          message: `Your referral code was used by ${
            currentUserData.name || 'a new user'
          }! You will earn 100,000 after they login 5 consecutive days.`,
        });
      }
      Alert.alert('Success', 'Referral code applied successfully!');
      navigation.replace('Drawer');
    } catch (error) {
      console.error('❌ Error applying referral code:', error);
      Alert.alert('Error', 'Failed to apply referral code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        width: '100%',
        flex: 1,
        backgroundColor: Colors[theme].subBack,
      }}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />
      <View style={styles.container}>
        <CustomHeaderText title="Do you have a referral code?" />
        <Text style={{color: Colours.textColour, fontSize: 16}}>
          Enter a referral code and earn 50,000 points for yourself and 100,000
          points for the referrer!
        </Text>
        <View style={styles.inputCon}>
          <CustomInput
            value={referralCode}
            onChangeText={setReferralCode}
            placeholder="Enter your referral code"
          />
        </View>
        <View style={{marginTop: 30, gap: 20}}>
          <CustomButton
            title="Submit Referral Code"
            onPress={handleReferralSubmit}
            isLoading={isLoading}
          />

          {/* <Pressable
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => navigation.replace('Questions')}>
            <Text
              style={{
                color: 'black',
                fontSize: 16,
                fontWeight: '700',
              }}>
              Don't have a referral code
            </Text>
          </Pressable> */}
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '80%',
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
            }}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>
              congratulations 🎉
            </Text>
            <Image
              source={require('../../assets/gift.png')}
              style={{
                width: 100,
                height: 100,
                alignSelf: 'center',
                marginVertical: 20,
              }}
            />
            <Text>
              {' '}
              You successfully got {promoCode.amount} from{' '}
              {promoCode.promoterName}
            </Text>
            <Pressable
              onPress={() => navigation.replace('Drawer')}
              style={{
                marginTop: 20,
                backgroundColor: Colours.primaryColour,
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
              }}>
              <Text style={{color: 'white'}}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {isLoading && <LoaderAnim />}
    </SafeAreaView>
  );
};

export default EnterReferral;

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      width: '100%',
      backgroundColor: Colors[theme].subBack,
    },
    inputCon: {
      marginTop: 20,
    },
  });
