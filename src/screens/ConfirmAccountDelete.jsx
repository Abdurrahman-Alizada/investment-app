import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import {Colours} from '../../constants/Details';
import CustomButton from '../components/CustomButtom';
import {useState} from 'react';
import {auth, db} from '../utils/firebase';
import {doc, setDoc} from 'firebase/firestore';
import {Alert} from 'react-native';
import LoaderAnim from '../components/Loader';

const ConfirmAccountDelete = ({navigation, route}) => {
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const reasons = route.params?.reasons || [];

  const handleDeleteAccount = async () => {
    setModalVisible(false);
    setLoading(true);

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        setLoading(false);
        return;
      }

      const userId = user.uid;

      // Log the reasons to Firebase or your backend
      const feedbackDocRef = doc(db, 'feedback', userId);
      await setDoc(feedbackDocRef, {
        reasons: reasons,
        timestamp: new Date(),
      });

      // Delete the user account
      await user.delete();

      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.',
      );
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      }); // Navigate to the login screen
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>
          Are you sure you want to delete your account?
        </Text>

        <Text style={styles.description}>
          Once you delete your account, all your data, including personal
          information, transaction history, investment records, and preferences,
          will be permanently removed from our servers. This action is
          irreversible and cannot be undone.
        </Text>

        <Text style={styles.sectionTitle}>
          By proceeding with account deletion, you acknowledge the following:
        </Text>

        <Text style={styles.listItem}>
          1. <Text style={styles.boldText}>Data Removal:</Text> All associated
          data will be deleted from our systems, including any rewards, bonuses,
          and referral information. You will no longer be able to recover this
          data.
        </Text>

        <Text style={styles.listItem}>
          3. <Text style={styles.boldText}>Access Revocation:</Text> You will
          lose access to all features and services provided by the app,
          including your investment portfolio and transaction history.
        </Text>

        <Text style={styles.listItem}>
          4. <Text style={styles.boldText}>Legal Compliance:</Text> Certain data
          may be retained for legal or regulatory purposes, as required by
          applicable laws. This data will not be accessible to you and will be
          securely stored.
        </Text>

        <Text style={styles.listItem}>
          5. <Text style={styles.boldText}>Feedback Submission:</Text> If you
          have provided feedback or reasons for account deletion, this
          information will be used solely for improving our services and will
          not be shared with third parties.
        </Text>

        <Text style={styles.description}>
          Please ensure that you have reviewed all necessary information and
          downloaded any data you wish to retain before proceeding. If you have
          any questions or concerns, please contact our support team.
        </Text>

        <Text style={styles.confirmation}>
          By confirming, you agree to permanently delete your account and all
          associated data.
        </Text>

        <View style={{width: '100%', marginVertical: 20}}>
          <CustomButton
            title="Confirm Account Deletion"
            onPress={() => setModalVisible(true)}
          />
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              width: '80%',
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: 'black',
                textAlign: 'center',
              }}>
              Are you sure you want to contnue?
            </Text>
            <Text style={{marginBottom: 20, textAlign: 'center'}}>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
              }}>
              <Pressable
                style={{
                  backgroundColor: 'white',
                  width: '48%',
                  padding: 10,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colours.primaryColour,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setModalVisible(false)}>
                <Text style={{color: Colours.primaryColour, fontWeight: '500'}}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={{
                  backgroundColor: Colours.primaryColour,
                  width: '48%',
                  padding: 10,
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={handleDeleteAccount} // Replace with your delete account function
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '500',
                  }}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

export default ConfirmAccountDelete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.backgroundColour,
    // paddingVertical:16
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
  },
  confirmation: {
    fontSize: 16,
    color: 'black',
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
