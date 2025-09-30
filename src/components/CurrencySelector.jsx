import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  useColorScheme,
} from 'react-native';
import {CurrencyContext} from '../../contexts/CurrencyContext';
import {Colours} from '../../constants/Details';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../../constants/Colors';

const CurrencySelector = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const {selectedCurrency, setSelectedCurrency, exchangeRates} =
    useContext(CurrencyContext);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCurrencySelect = currency => {
    setSelectedCurrency(currency);
    setIsModalVisible(false); // Close the modal after selection
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selected Currency:</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>{selectedCurrency}</Text>
        <Icon />
        <Icon name="chevron-down" size={20} color={Colours.primaryColour} />
      </TouchableOpacity>

      {/* Modal for currency selection */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Currency</Text>
            <FlatList
              data={Object.keys(exchangeRates)}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.currencyItem}
                  onPress={() => handleCurrencySelect(item)}>
                  <Text style={styles.currencyText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CurrencySelector;

const createStyles = theme =>
  StyleSheet.create({
    container: {
      margin: 16,
    },
    label: {
      color: Colors[theme].textColor,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    button: {
      backgroundColor: Colors[theme].background,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderColor: Colours.primaryColour,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonText: {
      color: Colours.primaryColour,
      fontSize: 16,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      width: '80%',
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
      textAlign: 'center',
    },
    currencyItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    currencyText: {
      fontSize: 16,
      color: '#333',
    },
    closeButton: {
      backgroundColor: '#F44336',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
