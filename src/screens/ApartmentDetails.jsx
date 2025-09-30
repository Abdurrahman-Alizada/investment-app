import React, {useEffect, useState} from 'react';
import {
  useColorScheme,
  ActivityIndicator,
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import firestore, {collection, getDoc, doc} from '@firebase/firestore';
import {Colours} from '../../constants/Details';
import CustomButton from '../components/CustomButtom';
import CustomModal from '../components/CustomModal';
import {Colors} from '../../constants/Colors';
import {db} from '../utils/firebase';

const screenWidth = Dimensions.get('window').width;

export default function SolarDetails({navigation, route}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light'; // Determine
  styles = createStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);
  const {id} = route.params || {};
  const [investment, setInvestment] = useState(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        if (!id) {
          console.warn('Missing document ID');
          return;
        }

        // Initialize Firestore
        const docId = 'VrT66Kjql1FZpiKwKeG3';

        // Reference to the specific document
        const ref = doc(
          collection(db, 'investmentPosters', docId, 'apartmentPosters'),
          id,
        );

        // Fetch the document
        const querySnapshot = await getDoc(ref);

        if (querySnapshot.exists()) {
          setInvestment(querySnapshot.data());
          console.log('Fetched data:', querySnapshot.data());
        } else {
          console.log('No such document!');
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
      fromScreen: 'apartment',
      solarDetails: investment,
    });
  };

  if (!investment) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.2)',
        }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Image Slider */}
        <FlatList
          data={investment.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <Image
              source={{uri: item}}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          removeClippedSubviews={false}
        />

        {/* Investment Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Investment Details</Text>

          <DetailItem
            icon="cash-outline"
            label="Total Amount"
            value={`LKR ${investment.totalAmount?.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
          <DetailItem
            icon="home-outline"
            label="Square Feet"
            value={`${investment.squarefeet} sqft`}
          />
          {investment?.roomCount && (
            <DetailItem
              icon="bed-outline"
              label="Rooms"
              value={`${investment.roomCount} Rooms`}
            />
          )}
          {investment?.swimmingPool && (
            <DetailItem
              icon="water-outline"
              label="Swimming Pool"
              value={investment.swimmingPool}
            />
          )}
          {investment?.bathroomCount && (
            <DetailItem
              icon="man-outline"
              label="Bathrooms"
              value={`${investment.bathroomCount} Bathrooms`}
            />
          )}
          {investment?.apartmentView && (
            <DetailItem
              icon="eye-outline"
              label="View"
              value={investment.apartmentView}
            />
          )}
        </View>

        {/* Deductions */}
      </ScrollView>

      {/* Invest Button */}
      <View style={styles.investButtonContainer}>
        <CustomButton
          title="Invest in this Plan"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Confirmation Modal */}
      <View>
        <CustomModal
          visible={modalVisible}
          title="Confirmation"
          iconName="alert-circle-outline"
          subtitle="Are you sure you want to proceed?"
          onConfirm={handleInvest}
          onCancel={() => setModalVisible(false)}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const DetailItem = ({icon, label, value}) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIconBox}>
      <Icon name={icon} size={24} color={Colours.primaryColour} />
    </View>
    <View style={styles.detailTextBox}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const createStyles = theme =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    scrollViewContent: {
      paddingBottom: 20,
      backgroundColor: Colors[theme].background,
    },
    image: {
      width: screenWidth - 40,
      height: 250,
      borderRadius: 15,
      marginHorizontal: 20,
      marginTop: 10,
    },
    detailsContainer: {
      padding: 20,
      backgroundColor: Colors[theme].buttonBackground,
      borderRadius: 15,
      margin: 20,
      elevation: 3,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOpacity: 0.2,
      shadowRadius: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
    deductionsContainer: {
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 15,
      margin: 20,
      elevation: 5,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: Colors[theme].textColor,
      marginBottom: 20,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      backgroundColor: Colors[theme].subBack,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
      width: '100%',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    detailIconBox: {
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailTextBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingLeft: 8,
    },
    detailLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors[theme].textColor,
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 14,
      color: Colors[theme].gray,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
    },
    investButtonContainer: {
      padding: 15,
      borderTopWidth: 0.5,
      borderColor: Colors[theme].primaryColour,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors[theme].background,
    },
  });
