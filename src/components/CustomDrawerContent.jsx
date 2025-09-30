// CustomDrawer.js
import { View, Text, TouchableOpacity } from 'react-native';

const CustomDrawerContent = ({ navigation }) => {
  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity onPress={() => navigation.navigate('DailyRewards')}>
        <Text>Daily Rewards</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Referral')}>
        <Text>Referral</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDrawerContent;