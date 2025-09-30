import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  TextInput,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import Header from '../components/Header';
import CustomModal from '../components/CustomModal';
import {Colours} from '../../constants/Details';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {collection, getDocs} from 'firebase/firestore';
import {db} from '../utils/firebase';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdId} from '../ads/adsConfig'; // Import the banner ad ID
import LoaderAnim from '../components/Loader';
import {Colors} from '../../constants/Colors';

const {width} = Dimensions.get('window');

const StockListScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme == 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]); // For filtered stocks
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  const fetchStocks = async () => {
    try {
      const stocksRef = collection(db, 'cseStocks');
      const snapshot = await getDocs(stocksRef);
      const stocksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStocks(stocksData);
      setFilteredStocks(stocksData); // Initialize filtered stocks
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStocks();
  };

  const handleSearch = query => {
    setSearchQuery(query);

    // Filter stocks based on the search query
    const filtered = stocks.filter(
      stock =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredStocks(filtered);
  };

  const handleStockPress = stock => {
    setSelectedStock(stock);
  };

  const handleBuyNow = stock => {
    navigation.navigate('BuyStock', {stock});
  };

  const renderStockItem = ({item, index}) => (
    <View style={styles.stockCardContainer}>
      <TouchableOpacity onPress={() => handleBuyNow(item)} activeOpacity={0.9}>
        <View
          // colors={['#ffffff', '#f8f9fa']}
          style={styles.stockCard}>
          <View style={styles.stockHeader}>
            <View style={styles.symbolContainer}>
              <Text style={styles.stockSymbol}>{item.symbol}</Text>
              {/* <View style={[
                styles.statusBadge,
                { backgroundColor: item.change >= 0 ? '#E8F5E9' : '#FFEBEE' }
              ]}> */}
              {/* <Icon 
                  name={item.change >= 0 ? 'trending-up' : 'trending-down'} 
                  size={14} 
                  color={item.change >= 0 ? '#2E7D32' : '#D32F2F'} 
                /> */}
              {/* <Text style={[
                  styles.changeText,
                  { color: item.change >= 0 ? '#2E7D32' : '#D32F2F' }
                ]}>
                  {item.change}%
                </Text> */}
              {/* </View> */}
            </View>
            <Text style={styles.stockName}>{item.name}</Text>
          </View>

          <View style={styles.stockDetails}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Last Price</Text>
              <Text style={styles.detailValue}>LKR {item.price}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Shared Issued</Text>
              <Text style={styles.detailValue}>{item.sharesIssued}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Market Cap</Text>
              <Text style={styles.detailValue}>{item.marketCap}M</Text>
            </View>
          </View>

          <View style={styles.tradingButton}>
            <Icon name="cash" size={20} color={Colours.primary} />
            <Text style={styles.tradingButtonText}>Buy Now</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
      <Header navigation={navigation} />
      <View style={styles.content}>
        <Text style={styles.title}>Colombo Stock Exchange</Text>
        <Text style={styles.subtitle}>Live market data and trading</Text>

        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search stocks by name or symbol"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FlatList
          data={filteredStocks} // Use filtered stocks for the list
          keyExtractor={item => item.id}
          renderItem={renderStockItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colours.primary}
            />
          }
        />
      </View>

      {selectedStock && (
        <CustomModal
          visible={!!selectedStock}
          title="Stock Details"
          iconName="chart-line"
          subtitle={`${selectedStock.name} (${selectedStock.symbol})`}
          onClose={() => setSelectedStock(null)}>
          <View style={styles.modalContent}>
            {/* Add detailed stock information here */}
          </View>
        </CustomModal>
      )}
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
    content: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors[theme].textColor,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: Colors[theme].gray,
      marginBottom: 16,
    },
    searchBar: {
      backgroundColor: Colors[theme].background,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    listContent: {
      paddingBottom: 24,
    },
    stockCardContainer: {
      marginBottom: 16,
    },
    stockCard: {
      borderRadius: 16,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
      backgroundColor: Colors[theme].subHeader,
    },
    stockHeader: {
      marginBottom: 12,
    },
    symbolContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    stockSymbol: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors[theme].textColor,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
    },
    changeText: {
      fontSize: 12,
      fontWeight: Colors[theme].textColor,
    },
    stockName: {
      fontSize: 14,
      color: Colors[theme].textColor,
    },
    stockDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#f0f0f0',
    },
    detailColumn: {
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 12,
      color: Colors[theme].gray,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[theme].textColor,
    },
    tradingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      gap: 8,
    },
    tradingButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colours.primary,
    },
  });

export default StockListScreen;
