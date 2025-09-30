import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  Pressable,
  Button,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import {Colours, height} from '../../constants/Details';
import {db, auth} from '../utils/firebase';
import {doc, getDoc, updateDoc, arrayUnion} from 'firebase/firestore';

import {rewardedAdId} from '../ads/adsConfig';
import {RewardedAd, RewardedAdEventType} from 'react-native-google-mobile-ads';
import CustomButton from '../components/CustomButtom';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';

const DailyRewards = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [rewards, setRewards] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [cooldownTime, setCooldownTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const [bonusCooldown, setBonusCooldown] = useState(0);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [loaded2, setLoaded2] = useState(false);

  const [isRewardedAdLoaded, setIsRewardedAdLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchUserProgress();
      generateRewards();
    }, []),
  );

  useEffect(() => {
    const cooldownTime = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds
    calculateBonusCooldown(cooldownTime);
    fetchUserProgress();
    initReward();
  }, []);

  const initReward = async () => {
    rewardedAd.load();
    console.log('Rewarded Ad init started...');

    const rewardedAd = RewardedAd.createForAdRequest(rewardedAdId);
    console.log('RewardedAd instance created with ID:', rewardedAdId);

    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsRewardedAdLoaded(rewardedAd);
      console.log('✅ Rewarded ad loaded successfully');
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log('🎉 User earned reward:', reward);
      handleBonusReward();
      // Handle the reward here, e.g., update user balance
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.FAILED_TO_LOAD, error => {
      console.log('❌ Rewarded ad failed to load:', error);
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      console.log('ℹ️ Rewarded ad closed by user');
    });

    console.log('Loading rewarded ad...');
    rewardedAd.load();
  };

  const showRewardedAd = () => {
    if (isRewardedAdLoaded) {
      isRewardedAdLoaded.show();
    } else {
      console.log('Rewarded ad not loaded yet');
    }
  };

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.error('User not logged in');
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Remove the 20-day check completely
        // const signupDate = userData.signupDate.toDate();
        // const currentDate = new Date(Date.now());
        // const daysSinceSignup = Math.floor((currentDate - signupDate) / (1000 * 60 * 60 * 24));
        // if (daysSinceSignup >= 20) {
        //   Alert.alert('Reward System Closed', 'The 20-day reward period has ended.');
        //   setLoading(false);
        //   return;
        // }

        // Remove streak reset logic
        // const lastClaimedTimestamp = userData.lastClaimedTimestamp || 0;
        // const lastClaimedDate = lastClaimedTimestamp ? new Date(lastClaimedTimestamp) : null;
        // const daysSinceLastClaim = lastClaimedDate ? Math.floor((currentDate - lastClaimedDate) / (1000 * 60 * 60 * 24)) : 0;
        // if (daysSinceLastClaim > 1) {
        //   await updateDoc(userDocRef, {
        //     currentDay: 1,
        //     currentStreak: 0,
        //     claimedRewards: [],
        //     lastClaimedTimestamp: 0,
        //   });
        //   setCurrentDay(1);
        //   setCurrentStreak(0);
        //   setClaimedRewards([]);
        //   generateRewards(1, []);
        // } else {
        setCurrentDay(userData.currentDay || 1);
        setCurrentStreak(userData.currentStreak || 0);
        setClaimedRewards(userData.claimedRewards || []);
        generateRewards(
          userData.currentDay || 1,
          userData.claimedRewards || [],
        );
        // }

        calculateCooldown(userData.lastClaimedTimestamp);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRewards = (currentDay, claimedRewards) => {
    const rewardsData = [];
    // Remove the 20-day limit, let it generate based on current progress
    const maxDay = Math.max(currentDay, 20); // Show at least 20 days

    for (let day = 1; day <= maxDay; day++) {
      rewardsData.push({
        day,
        amount: `LKR ${Math.pow(2, day - 1)}`,
        isClaimed: claimedRewards.includes(day),
        isActive: day <= currentDay,
      });
    }
    setRewards(rewardsData);
  };

  const calculateCooldown = lastClaimedTimestamp => {
    if (!lastClaimedTimestamp) return;

    const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const currentTime = new Date(Date.now()); // Use getCurrentTime() instead of Date.now()
    const timeRemaining =
      cooldownDuration - (currentTime - lastClaimedTimestamp);

    if (timeRemaining > 0) {
      setCooldownTime(timeRemaining);
      const interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCooldownTime(0);
    }
  };

  const formatTime = milliseconds => {
    if (!milliseconds || milliseconds <= 0) return '00:00:00';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const handleClaim = async day => {
    initReward();

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          'Error',
          'User not logged in. Please log in to claim rewards.',
        );
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
          await processRewardAfterAd(day); // Separate function for reward processing
        },
      );
    } catch (error) {
      console.error('Error in handleClaim:', error);
      setLoading(false);
    }
  };
  const renderRewardBox = ({item}) => {
    // console.log('item', item)

    return (
      <View
        style={[
          styles.box,
          !item.isActive && styles.inactiveBox,
          item.isSpecial && styles.specialBox,
        ]}>
        <View style={styles.dayContainer}>
          <Icon
            name="calendar"
            size={16}
            color={item.isSpecial ? Colours.primaryColour : '#666'}
          />
          <Text
            style={[styles.dayText, item.isSpecial && styles.specialDayText]}>
            Day {item.day}
          </Text>
        </View>

        <View style={styles.rewardIconContainer}>
          <Icon name="gift" size={28} color="#666" />
        </View>

        <Text
          style={[
            styles.amountText,
            item.isSpecial && styles.specialAmountText,
          ]}>
          {item.amount}
        </Text>

        {item.isClaimed ? (
          <View style={styles.claimedContainer}>
            <Icon name="check-circle" size={16} color="green" />
            <Text style={styles.claimedText}>Claimed</Text>
          </View>
        ) : item.day === currentDay && cooldownTime ? (
          <View style={styles.claimButton}>
            <Text style={styles.claimText}>{formatTime(cooldownTime)}</Text>
          </View>
        ) : item.isActive ? (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => handleClaim(item.day)}>
            <Text style={styles.claimText}>Claim</Text>
          </TouchableOpacity>
        ) : null}

        {!item.isActive && item.isClaimed && (
          <View style={styles.lockedContainer}>
            <Icon name="lock" size={16} color="#666" />
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        )}
      </View>
    );
  };

  const calculateBonusCooldown = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const lastBonusClaim = userDoc.data().lastBonusClaim || 0;
        const currentTime = Date.now();
        const timeRemaining = 3600000 - (currentTime - lastBonusClaim); // 1 hour = 3600000 ms

        if (timeRemaining > 0) {
          setBonusCooldown(timeRemaining);
          startBonusTimer(timeRemaining); // Timer start செய்ய
        } else {
          setBonusCooldown(0);
        }
      }
    } catch (error) {
      console.error('Error calculating bonus cooldown:', error);
    }
  };

  const startBonusTimer = initialTime => {
    setBonusCooldown(initialTime);

    const timer = setInterval(() => {
      setBonusCooldown(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  };
  const handleBonusReward = async () => {
    try {
      setBonusLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          'Error',
          'User not logged in. Please log in to claim rewards.',
        );
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);

      // Update last bonus claim time
      const currentTime = Date.now();
      await updateDoc(userDocRef, {
        lastBonusClaim: currentTime,
      });

      // Update user's cash
      const totalAssetsRef = doc(db, 'users', user.uid, 'totalAssets', 'cash');
      const totalAssetsDoc = await getDoc(totalAssetsRef);
      const currentCash = totalAssetsDoc.exists()
        ? totalAssetsDoc.data().amount || 0
        : 0;

      await updateDoc(totalAssetsRef, {
        amount: currentCash + 5000,
      });

      Alert.alert('Success', 'You have received a bonus reward of LKR 5000!');

      // Start 1 hour cooldown
      startBonusTimer(3600000); // 1 hour in milliseconds
    } catch (error) {
      console.error('Error handling bonus reward:', error);
      Alert.alert('Error', 'Failed to process reward. Please try again.');
    } finally {
      setBonusLoading(false);
    }
  };

  const handleBonusClaim = () => {
    if (!isRewardedAdLoaded) {
      Alert.alert('Ad Loading', 'Please wait for the ad to load.');
      return;
    }

    setBonusLoading(true);

    try {
      isRewardedAdLoaded.show();
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      Alert.alert('Error', 'Failed to show ad. Please try again.');
    } finally {
      setBonusLoading(false);
    }
  };

  const processRewardAfterAd = async day => {
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);
      const currentDate = new Date(Date.now());
      const newCurrentDay = day + 1;
      const rewardAmount = Math.pow(2, day - 1);

      // Update Firestore first
      await updateDoc(userDocRef, {
        claimedRewards: arrayUnion(day),
        currentDay: newCurrentDay,
        currentStreak: (currentStreak || 0) + 1,
        lastClaimedTimestamp: currentDate.getTime(),
      });

      // Update cash
      const totalAssetsRef = doc(db, 'users', user.uid, 'totalAssets', 'cash');
      const totalAssetsDoc = await getDoc(totalAssetsRef);
      const currentCash = totalAssetsDoc.exists()
        ? totalAssetsDoc.data().amount || 0
        : 0;
      await updateDoc(totalAssetsRef, {amount: currentCash + rewardAmount});

      // Update local state TOGETHER
      setCurrentDay(newCurrentDay);
      setCurrentStreak(prev => prev + 1);
      setClaimedRewards(prev => [...prev, day]);

      // Force UI update by generating new rewards array
      generateRewards(newCurrentDay, [...claimedRewards, day]);

      calculateCooldown(currentDate.getTime());

      Alert.alert('Success', `You claimed the reward for Day ${day}!`);
      console.log('success');
      // Reload the ad for next time
      initReward();
    } catch (error) {
      console.error('Error processing reward:', error);
      Alert.alert(
        'Error',
        'Failed to update reward. Please check your connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.head}>Daily Rewards</Text>
          <View style={styles.streakContainer}>
            <Icon name="trophy" size={24} color={Colours.primaryColour} />
            <Text style={styles.streakText}>
              Current Streak:{' '}
              <Text style={styles.streakCount}>{currentStreak} days</Text>
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Log in daily to earn rewards and maintain your streak!
          </Text>
        </View>
        {/* <Pressable
          onPress={handleBonusClaim}
          style={{
            backgroundColor: 'blue', 
            padding: 15,
            margin: 20,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{color: 'white', fontSize: 16}}>
            {isRewardedAdLoaded ? 'Watch Ad' : 'Loading Ad...'}
          </Text>
        </Pressable> */}

        <View style={{margin: 20}}>
          {/* <CustomButton
            onPress={handleBonusClaim}
            title={
              isRewardedAdLoaded
                ? 'Watch video and get bonus 5000'
                : 'Loading Ad...'
            }
          /> */}

          <TouchableOpacity
            style={[
              styles.bonusButton,
              bonusCooldown > 0 && styles.disabledButton,
            ]}
            onPress={handleBonusClaim}
            // onPress={()=>navigation.push('AdTest')}
            disabled={bonusLoading || bonusCooldown > 0}>
            {bonusLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Icon name="star" size={20} color="gold" />
                <Text style={styles.bonusText}>
                  {bonusCooldown > 0
                    ? `Next in ${formatTime(bonusCooldown)}`
                    : 'Claim 5000 LKR Bonus'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={rewards}
          renderItem={renderRewardBox}
          keyExtractor={item => item.day.toString()}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          removeClippedSubviews={false}
        />

        {/* <View style={styles.bonusContainer}>
  <TouchableOpacity 
    style={[
      styles.bonusButton,
      bonusCooldown > 0 && styles.disabledButton
    ]}
    onPress={handleBonusClaim}

    // onPress={()=>navigation.push('AdTest')}
    disabled={bonusLoading || bonusCooldown > 0}
  >
    {bonusLoading ? (
      <ActivityIndicator color="white" />
    ) : (
      <>
        <Icon name="star" size={20} color="gold" />
        <Text style={styles.bonusText}>
          {bonusCooldown > 0 ? 
            `Next in ${formatTime(bonusCooldown)}` : 
            'Claim 5000 LKR Bonus'}
        </Text>
      </>
    )}
  </TouchableOpacity>

</View> */}
      </ScrollView>
      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

export default DailyRewards;

const createStyles = theme =>
  StyleSheet.create({
    bonusContainer: {
      margin: 20,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: Colors[theme].background,
      flex: 1,
    },
    bonusButton: {
      backgroundColor: Colors[theme].primaryColour,
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    disabledButton: {
      backgroundColor: '#ccc',
    },
    bonusText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 10,
      fontSize: 16,
    },
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: Colors[theme].background,
    },
    scrollView: {
      height: height * 0.91,
      width: '100%',
      marginBottom: 80,
      backgroundColor: Colors[theme].background,
    },
    headerContainer: {
      padding: 20,
      backgroundColor: Colors[theme].subHeader,
    },
    head: {
      color: Colors[theme].textColor,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 10,
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    streakText: {
      fontSize: 16,
      color: Colors[theme].textColor,
      marginLeft: 8,
    },
    streakCount: {
      color: Colours.primaryColour,
      fontWeight: '600',
    },
    infoContainer: {
      backgroundColor: '#f8f9fa',
      padding: 15,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: Colours.primaryColour,
    },
    infoText: {
      color: '#666',
      fontSize: 14,
    },
    listContainer: {
      padding: 20,
    },
    row: {
      justifyContent: 'flex-start',
      marginBottom: 15,
      gap: 12,
    },
    box: {
      width: '31%',
      padding: 12,
      backgroundColor: '#fff',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      borderWidth: 1,
      borderColor: Colours.subButton,
    },
    specialBox: {
      borderWidth: 2,
      borderColor: Colours.primaryColour,
      backgroundColor: '#fff',
    },
    inactiveBox: {
      opacity: 0.7,
      backgroundColor: '#f5f5f5',
    },
    dayContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
      marginLeft: 4,
    },
    specialDayText: {
      color: Colours.primaryColour,
    },
    rewardIconContainer: {
      marginVertical: 8,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    amountText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
      textAlign: 'center',
    },
    specialAmountText: {
      color: Colours.primaryColour,
      fontWeight: '600',
    },
    claimButton: {
      backgroundColor: Colours.primaryColour,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      width: '100%',
    },
    specialClaimButton: {
      backgroundColor: Colours.primaryColour,
    },
    claimText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    claimedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    claimedText: {
      color: 'green',
      fontSize: 12,
      marginLeft: 4,
      fontWeight: '500',
    },
    lockedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    lockedText: {
      color: '#666',
      fontSize: 12,
      marginLeft: 4,
      fontWeight: '500',
    },
  });
