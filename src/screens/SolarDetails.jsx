import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import firestore, {doc, getDoc} from 'firebase/firestore';
import {Colours} from '../../constants/Details';
import CustomModal from '../components/CustomModal';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {db} from '../utils/firebase';
import {bannerAdId} from '../ads/adsConfig';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {Colors} from '../../constants/Colors';

const {width} = Dimensions.get('window');

// Create an Animated version of FlatList
const AnimatedFlatList = RNAnimated.createAnimatedComponent(FlatList);

export default function SolarDetails({navigation, route}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light'; // Determine
  styles = createStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [scrollX] = useState(new RNAnimated.Value(0));
  const {id} = route.params || {};
  const [investment, setInvestment] = useState(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        if (!id) {
          console.warn('Missing document ID');
          return;
        }

        const docId = 'BpXWNAOoq7fVubDc77cJ';
        const ref = doc(db, 'investmentPosters', docId, 'solarPosters', id);

        const querySnapshot = await getDoc(ref);

        if (querySnapshot.exists()) {
          setInvestment(querySnapshot.data());
        } else {
          console.warn('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    getDetails();
  }, [id]);

  const handleInvest = () => {
    setModalVisible(false);
    navigation.push('EnterAmount', {
      fromScreen: 'solar',
      solarDetails: investment,
      id: id,
    });
  };

  if (!investment) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.2)',
        }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  const renderImagePaginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {investment.images.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.2, 1],
            extrapolate: 'clamp',
          });

          return (
            <RNAnimated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  opacity,
                  transform: [{scale}],
                  backgroundColor:
                    activeImageIndex === index
                      ? Colours.primaryColour
                      : '#D1D1D1',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageContainer}>
          {/* Use AnimatedFlatList instead of FlatList */}
          <AnimatedFlatList
            data={investment?.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={RNAnimated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {useNativeDriver: true},
            )}
            onMomentumScrollEnd={e => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / width,
              );
              setActiveImageIndex(newIndex);
            }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item}) => (
              <Image
                source={{uri: item}}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            removeClippedSubviews={false}
          />
          {renderImagePaginator()}
        </View>

        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.detailsCard}>
          <View
            // colors={['#ffffff', '#f8f9fa']}
            style={styles.cardGradient}>
            <Text style={styles.sectionTitle}>Investment Overview</Text>
            <View style={styles.statsContainer}>
              <StatItem
                icon="cash-multiple"
                label="Total Investment"
                value={`Rs. ${investment.totalAmount}`}
                color="#4CAF50"
              />
              <StatItem
                icon="flash"
                label="Power Output"
                value={`${investment.kiloWatts} KW`}
                color="#2196F3"
              />
              <StatItem
                icon="chart-line-variant"
                label="Monthly Returns"
                value={`Rs. ${investment.monthlyProfit}`}
                color="#FF9800"
              />
              <StatItem
                icon="map-marker"
                label="Location"
                value={investment.location}
                color="#9C27B0"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.detailsCard}>
          <View
            // colors={['#ffffff', '#f8f9fa']}
            style={styles.cardGradient}>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <View style={styles.detailsGrid}>
              <DetailItem
                icon="chart-areaspline"
                label="Investable Amount"
                value={`Rs. ${investment.investableAmount}`}
              />
              <DetailItem
                icon="ruler-square"
                label="Land Area"
                value={`${investment.squarefeet} sqft`}
              />
              <DetailItem
                icon="home-city"
                label="Land Rent"
                value={`Rs. ${investment.landRent}`}
              />
              <DetailItem
                icon="wrench"
                label="Maintenance"
                value={`Rs. ${investment.maintanace}`}
              />
              <DetailItem
                icon="shield-check"
                label="Security"
                value={`RS. ${investment.security}`}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
        <TouchableOpacity
          style={styles.investButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="solar-power" size={24} color="white" />
          <Text style={styles.investButtonText}>Invest in This Project</Text>
        </TouchableOpacity>
      </Animated.View>

      <CustomModal
        visible={modalVisible}
        title="Confirm Investment"
        iconName="alert-circle"
        subtitle="Are you ready to proceed with this investment?"
        onConfirm={handleInvest}
        onCancel={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const StatItem = ({icon, label, value, color}) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconContainer, {backgroundColor: `${color}15`}]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const DetailItem = ({icon, label, value}) => (
  <View style={styles.detailItem}>
    <Icon name={icon} size={24} color={Colours.primaryColour} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const createStyles = theme =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    scrollViewContent: {
      paddingBottom: 100,
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width,
      height: 300,
    },
    paginationContainer: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 16,
      alignSelf: 'center',
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    detailsCard: {
      margin: 16,
      borderRadius: 16,
      overflow: 'hidden',
      // elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      // backgroundColor:'white'
    },
    cardGradient: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors[theme].textColor,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    statItem: {
      width: '47%',
      backgroundColor: Colors[theme].buttonBackground,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statLabel: {
      fontSize: 14,
      color: Colors[theme].textColor,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[theme].textColor,
    },
    detailsGrid: {
      gap: 16,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[theme].subHeader,
      padding: 16,
      borderRadius: 12,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    detailLabel: {
      flex: 1,
      fontSize: 16,
      color: Colors[theme].textColor,
      marginLeft: 12,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[theme].textColor,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors[theme].background,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#666',
    },
    investButton: {
      borderRadius: 24,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: Colours.primaryColour,
    },
    investButtonGradient: {},
    investButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });
