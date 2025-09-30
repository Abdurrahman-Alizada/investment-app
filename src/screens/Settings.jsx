import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  SafeAreaView,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from '../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colours } from '../../constants/Details';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';



const SettingsScreen = ({navigation}) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);


  // const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      // Sign out from Firebase Authentication
      // await auth.signOut();
  
      // // Clear AsyncStorage
      // await AsyncStorage.clear();
  
      // // Reset navigation to the Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }], // Ensure that 'Splash' is the correct screen name
      });
  
    } catch (error) {
      console.error('Logout error:', error);
      // Alert for logout failure
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };
  



  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              await user.delete();
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const SettingItem = ({ icon, title, value, onValueChange, type = 'toggle' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color="#666" />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#d1d1d1', true: Colours.primaryColour }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Icon name="chevron-right" size={24} color="#666" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 0.8, backgroundColor: Colours.backgroundColour,marginBottom:100 }}>
      <Header navigation={navigation}/>
       <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="email-outline"
          title="Email Notifications"
          value={emailNotifications}
          onValueChange={setEmailNotifications}
        />
        <SettingItem
          icon="bell-outline"
          title="Push Notifications"
          value={pushNotifications}
          onValueChange={setPushNotifications}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleLogout}
        >
          <View style={styles.settingLeft}>
            <Icon name="logout" size={24} color="#666" />
            <Text style={styles.settingText}>Logout</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleDeleteAccount}
        >
          <View style={styles.settingLeft}>
            <Icon name="delete-outline" size={24} color="#dc3545" />
            <Text style={[styles.settingText, styles.deleteText]}>Delete Account</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="information-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>


      <Button title='hi' onPress={()=>navigation.push('Splash')}/>
    </ScrollView>
    </SafeAreaView>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.1,
    backgroundColor: Colours.backgroundColour,
    padding: 10,
    marginBottom: 100,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colours.backgroundColour,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colours.backgroundColour,
    borderRadius: 8,
    
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  settingText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
        fontWeight:'500'
  },
  deleteText: {
    color: '#dc3545',
  },
  versionText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SettingsScreen;