import React, {useState, useEffect} from 'react';
import {
  useColorScheme,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/Header';
import {collection, getDocs} from 'firebase/firestore';
import {db} from '../utils/firebase'; // Import Firebase config
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colours} from '../../constants/Details';
import LottieView from 'lottie-react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId, rewardedAdId} from '../ads/adsConfig';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';

const {width, height} = Dimensions.get('window');

const solidColors = [
  '#4CAF50', // Green
  '#1976D2', // Blue
  '#FFA000', // Amber
  '#7B1FA2', // Purple
];

// Sample Data (Replace with Firebase fetch in future)
const investmentData = [
  {
    id: '1',
    title: '1000 kilowats',
    percentage: 'LKR.20,000,000',
    description: 'LKR 12,000,000',
    investmentText:
      'If you invested $10,000 in Dec 2009\nyou would have $13,193 in Dec 2024',
  },
  {
    id: '2',
    title: 'Moderate Growth',
    percentage: '5.42%',
    description: 'Projected moderate growth returns',
    investmentText:
      'If you invested $10,000 in Dec 2009\nyou would have $18,500 in Dec 2024',
  },
  {
    id: '3',
    title: 'Aggressive Growth',
    percentage: '8.79%',
    description: 'Higher risk, higher returns',
    investmentText:
      'If you invested $10,000 in Dec 2009\nyou would have $25,000 in Dec 2024',
  },
];

export default function ApartmentPosters({navigation}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const docId = 'VrT66Kjql1FZpiKwKeG3'; // Replace with an actual document ID
        const solarPostersRef = collection(
          db,
          `investmentPosters/${docId}/apartmentPosters`,
        );
        const querySnapshot = await getDocs(solarPostersRef);

        const investmentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: '4 Rooms',
          ...doc.data(),
        }));

        console.log(investmentsData);

        setInvestments(investmentsData);
        console.log('Fetched Investments:', investments);
        return investments;
      } catch (error) {
        console.error('Error fetching investments:', error);
        return [];
      }
    };
    fetchInvestments();
  }, []);

  const renderCard = ({item, index}) => {
    const isSelected = selectedCard === item.id;
    const colors = solidColors[index % solidColors.length];

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100)}
        style={[styles.cardContainer, isSelected && styles.selectedCard]}>
        <View
          style={[
            styles.card,
            {backgroundColor: colors}, // Apply solid color
          ]}>
          <View style={styles.cardHeader}>
            <Icon name="office-building" size={32} color="white" />
            <Text style={styles.cardTitle}>{item.roomCount} Rooms</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Apartment</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Icon name="cash-multiple" size={24} color="white" />
              <Text style={styles.infoText}>
                Total Investment: {item.totalAmount}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="chart-line" size={24} color="white" />
              <Text style={styles.infoText}>
                Investable: LKR {item.investableAmount}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="trending-up" size={24} color="white" />
              <Text style={styles.infoText}>
                Expected Value Growth {item.expectedValueGrowth}
              </Text>
            </View>
          </View>

          <View style={styles.graphContainer}>
            <LottieView
              source={require('../../assets/animation/realEstate.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                navigation.push('ApartmentDetails', {id: item.id})
              }>
              <Icon name="information" size={20} color={'black'} />
              <Text style={[styles.detailsButtonText, {color: 'black'}]}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Real Estate Plans</Text>
          <Text style={styles.headerSubtitle}>
            Choose your investment portfolio
          </Text>
        </View>

        <FlatList
          data={investments}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            {paddingHorizontal: (width - width * 0.85) / 8}, // Center first/last card
          ]}
          snapToInterval={width * 0.85 + width * 0.05 * 2} // Card width + margin
          snapToAlignment="center"
          decelerationRate="fast"
          removeClippedSubviews={false}
        />
      </View>
      {loading && <LoaderAnim />}
    </SafeAreaView>
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
      paddingVertical: 16,
    },
    headerSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: Colors[theme].textColor,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: Colors[theme].textColor,
    },
    listContainer: {
      paddingHorizontal: 10,
    },
    cardContainer: {
      width: width * 0.85,
      marginHorizontal: width * 0.05,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    selectedCard: {
      transform: [{scale: 1.02}],
      elevation: 5,
    },
    card: {
      borderRadius: 24,
      padding: 16,
      height: height * 0.65,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: 'white',
      marginLeft: 12,
      flex: 1,
    },
    badge: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    badgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    cardBody: {
      marginBottom: 24,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    infoText: {
      color: 'white',
      fontSize: 16,
      marginLeft: 12,
      fontWeight: '500',
    },
    graphContainer: {
      height: height * 0.25,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
    },
    lottieAnimation: {
      width: '100%',
      height: '100%',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      width: '100%',
      justifyContent: 'center',
    },
    detailsButtonText: {
      marginLeft: 8,
      fontWeight: '600',
      fontSize: 14,
      color: 'black',
    },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    selectButtonText: {
      color: 'white',
      marginLeft: 8,
      fontWeight: '600',
      fontSize: 14,
    },
    proceedButton: {
      margin: 20,
    },
    proceedGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 16,
    },
    proceedButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
  });
