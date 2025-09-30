import React, {useRef, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Share,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import Header from '../components/Header';
import {Colours} from '../../constants/Details';
import Lottie from 'lottie-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getDoc, doc} from 'firebase/firestore';
import {auth} from '../utils/firebase';
import {db} from '../utils/firebase'; // Ensure you import your Firestore instance
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {Colors} from '../../constants/Colors';

const Referral = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const animationRef = useRef < Lottie > null;
  const [referralCode, setReferralCode] = useState('');
  const [playStoreLink, setPlayStoreLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [customReferralCode, setCustomReferralCode] = useState(''); // For user-entered referral code
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    console.log('User Data:', userData);
  }, [userData]);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error('User not logged in!');
          setLoading(false);
          return;
        }

        // Fetch referral code
        const referralDocRef = doc(db, 'users', userId);
        const referralDocSnap = await getDoc(referralDocRef);

        if (referralDocSnap.exists()) {
          const data = referralDocSnap.data();
          setUserData(data);
          setReferralCode(data.referralCode || 'N/A');
        } else {
          console.warn('Referral code not found for this user.');
          setReferralCode('N/A');
        }

        // Fetch Play Store link
        const playStoreDocRef = doc(db, 'others', 'playstoreLink');
        const playStoreDocSnap = await getDoc(playStoreDocRef);

        if (playStoreDocSnap.exists()) {
          setPlayStoreLink(playStoreDocSnap.data().link || '');
        } else {
          console.warn('Play Store link not found in Firebase.');
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        setReferralCode('N/A');
        setPlayStoreLink('');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  const referralLink = `${playStoreLink}`;

  const copyToClipboard = () => {
    Clipboard.setString(referralCode);
    animationRef.current?.play();
  };

  const handleShare = async () => {
    try {
      const linkToShare = customReferralCode
        ? `${playStoreLink}?ref=${customReferralCode}`
        : referralLink;

      await Share.share({
        message: `Join me on Renzo Invest! Use my referral code ${
          customReferralCode || referralCode
        } to get started: ${linkToShare}`,
        title: 'Join Renzo Invest',
      });
    } catch (error) {
      console.error('Error sharing referral link:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Header navigation={navigation} />
          <View style={styles.content}>
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={styles.headerSection}>
              <Text style={styles.title}>Invite Friends</Text>
              <Text style={styles.subtitle}>
                Share Renzo Invest with friends and both get rewards
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400)}
              style={styles.animationContainer}>
              <Image
                source={require('../../assets/gift.png')}
                style={styles.image}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(600)}
              style={styles.rewardsSection}>
              <View style={styles.rewardCard}>
                <Icon name="gift" size={24} color={Colours.primaryColour} />
                <Text style={styles.rewardText}>
                  Get LKR 100,000 for each referral
                </Text>
              </View>
              <View style={styles.rewardCard}>
                <Icon
                  name="account-group"
                  size={24}
                  color={Colours.primaryColour}
                />
                <Text style={styles.rewardText}>
                  Friend gets LKR 50,000 signup bonus
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(800)}
              style={styles.codeSection}>
              <Text style={styles.codeLabel}>Your Referral Code</Text>
              <Pressable style={styles.codeContainer} onPress={copyToClipboard}>
                <Text style={styles.code}>
                  {loading ? 'Loading...' : referralCode}
                </Text>
                <Icon
                  name="content-copy"
                  size={20}
                  color={Colours.primaryColour}
                />
              </Pressable>
            </Animated.View>

            {/* <Animated.View entering={FadeInUp.delay(900)} style={styles.inputSection}>
              <Text style={styles.inputLabel}>Enter Custom Referral Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter referral code"
                value={customReferralCode}
                onChangeText={setCustomReferralCode}
              />
            </Animated.View> */}
            {(!userData.referreleByOtherUser || !userData.referredByPromo) && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}>
                <Text
                  style={[
                    styles.rewardText,
                    {textAlign: 'center', color: Colors[theme].textColor},
                  ]}>
                  I have a referral code{' '}
                </Text>
                <Pressable onPress={() => navigation.navigate('EnterReferral')}>
                  <Text
                    style={[
                      styles.rewardText,
                      {
                        textAlign: 'center',
                        color: Colours.primaryColour,
                        textDecorationLine: 'underline',
                      },
                    ]}>
                    Enter referral code
                  </Text>
                </Pressable>
              </View>
            )}

            <Animated.View
              entering={FadeInUp.delay(1000)}
              style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleShare}>
                <View style={styles.shareButton}>
                  <Icon name="share-variant" size={24} color="white" />
                  <Text style={styles.shareButtonText}>Share with Friends</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Referral;

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: Colors[theme].background,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'space-between',
      backgroundColor: Colors[theme].background,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 20,
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
      textAlign: 'center',
      lineHeight: 22,
    },
    animationContainer: {
      height: 100,
      marginVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: 150,
      height: 150,
      resizeMode: 'contain',
    },
    rewardsSection: {
      marginVertical: 20,
      gap: 12,
    },
    rewardCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e9e9e9',
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    rewardText: {
      fontSize: 16,
      color: '#1a1a1a',
      fontWeight: '500',
    },
    codeSection: {
      alignItems: 'center',
      marginVertical: 20,
    },
    codeLabel: {
      fontSize: 16,
      color: Colors[theme].textColor,
      marginBottom: 8,
    },
    codeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    code: {
      fontSize: 20,
      fontWeight: '600',
      color: Colours.primaryColour,
      letterSpacing: 1,
    },
    inputSection: {
      marginVertical: 20,
    },
    inputLabel: {
      fontSize: 16,
      color: Colors[theme].textColor,
      marginBottom: 8,
    },
    input: {
      backgroundColor: Colors[theme].inputBackground,
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      color: '#1a1a1a',
    },
    buttonContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 12,
      backgroundColor: Colours.primaryColour,
    },
    shareButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
  });
