import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import {Colours} from '../../constants/Details';
import CustomHeaderText from '../components/CustomHeaderText';
import CheckBox from '@react-native-community/checkbox'; // Ensure you install this library

import CustomButton from '../components/CustomButtom';
import toast from '../../helpers/toast';
import LoaderAnim from '../components/Loader';

const REASONS = [
  'I found a better alternative',
  'The app is too complicated',
  'I am not using the app enough',
  'I am facing technical issues',
  'I am concerned about privacy',
  'I no longer need the app',
  'I am not satisfied with the content',
  'Other',
];

const DeleteAccount = ({navigation}) => {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleReason = reason => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleDone = () => {
    if (selectedReasons.length === 0) {
      toast.info({
        message: 'Please select at least one reason before proceeding.',
      });
      return;
    }

    navigation.push('ConfirmAccountDelete', {reasons: selectedReasons});
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView style={[styles.container, {paddingHorizontal: 16}]}>
        <CustomHeaderText title="Delete Account" />
        <Text style={styles.subtitle}>
          Why did you decide to leave this app?
        </Text>
        <Text style={{marginTop: 10}}>
          We need your feedback to improve our app and provide a better
          experience for our users.
        </Text>

        <View style={{marginTop: 20}}>
          {REASONS.map(reason => (
            <View key={reason} style={styles.checkboxContainer}>
              <CheckBox
                value={selectedReasons.includes(reason)}
                onValueChange={() => toggleReason(reason)}
              />
              <Text style={styles.checkboxLabel}>{reason}</Text>
            </View>
          ))}
        </View>

        <View style={{width: '100%', marginTop: 20}}>
          <CustomButton title="Done" onPress={handleDone} />
        </View>
      </ScrollView>
      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.backgroundColour,
  },
  subtitle: {
    fontSize: 22,
    color: 'black',
    marginTop: 10,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: Colours.primaryColour,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
