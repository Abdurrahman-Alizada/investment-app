import { StyleSheet, View } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colours } from '../../constants/Details';

const BottomTabBarIcon = ({ route, isFocused }) => {
  const getIcon = (route, isFocused) => {
    let iconName;

    switch (route) {
      case 'Home':
        iconName = 'home-outline';
        break;
      case 'Portfolio':
        iconName = 'account-search';
        break;
      case 'Rewards':
        iconName = 'gift';
        break;
      case 'Settings':
        iconName = 'cog'
        break;
      default:
        iconName = 'help-circle-outline';
    }

    return <Icon name={iconName} size={30} color={isFocused ? 'white' : '#a585ff'} />;
  };

  return <View style={styles.iconContainer}>{getIcon(route, isFocused)}</View>;
};

export default BottomTabBarIcon;

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
});
