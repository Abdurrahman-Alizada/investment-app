import React, {useState} from 'react';
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
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {auth} from '../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colours, height} from '../../constants/Details';
import Header from '../components/Header';
import {useNavigation} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';
import CurrencySelector from '../components/CurrencySelector';
import CustomModal from '../components/CustomModal';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';

const AppSettings = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light'; // Determine
  const styles = createStyles(theme);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      setLoading(true);
      await auth.signOut();

      await AsyncStorage.clear();

      // // Reset navigation to the Login screen
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
      setLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Alert for logout failure
      setLoading(false);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const SettingItem = ({
    icon,
    title,
    value,
    onValueChange,
    type = 'toggle',
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color="#666" />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{false: '#d1d1d1', true: Colours.primaryColour}}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Icon name="chevron-right" size={24} color="#666" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors[theme].background}}>
      <Header navigation={navigation} />
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
            onPress={() => setModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Icon name="logout" size={24} color="#666" />
              <Text style={styles.settingText}>Logout</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('DeleteAccount')}>
            <View style={styles.settingLeft}>
              <Icon name="delete-outline" size={24} color="#dc3545" />
              <Text style={[styles.settingText, styles.deleteText]}>
                Delete Account
              </Text>
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

        <View>
          <CurrencySelector />
        </View>
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        title="Confirm Logout"
        iconName="alert-circle-outline"
        subtitle="Are you confirm to logout this account?"
        onConfirm={handleLogout}
        onCancel={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />

      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      // flex: 1,
      height: height * 0.91,
      backgroundColor: Colors[theme].background,
      padding: 10,
      marginBottom: 80,
    },
    section: {
      marginBottom: 24,
      backgroundColor: Colors[theme].background,
      // borderTopWidth: 1,
      // borderBottomWidth: 1,
      borderColor: '#eee',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[theme].textColor,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: Colors[theme].background,
      borderRadius: 8,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: Colors[theme].subHeader,
      // borderBottomWidth: 1,
      borderBottomColor: Colors[theme].gray,
      borderRadius: 8,
      marginTop: 3,
    },

    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingText: {
      fontSize: 16,
      color: Colors[theme].textColor,
      marginLeft: 12,
      fontWeight: '500',
    },
    deleteText: {
      color: '#dc3545',
    },
    versionText: {
      fontSize: 16,
      color: '#666',
    },
  });

export default AppSettings;
