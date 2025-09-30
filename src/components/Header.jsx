import React from 'react';
import {Dimensions, TouchableOpacity, View, useColorScheme} from 'react-native';
import {Colours} from '../../constants/Details';
import Icon from 'react-native-vector-icons/AntDesign';
import {Colors} from '../../constants/Colors';

const {width, height} = Dimensions.get('window');

const Header = ({
  showSetting = false,
  navigation,
  hiddenBack = false,
  showMenu = false,
  active,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  // const styles = createStyles(theme);

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <View
      style={{
        width: '100%',
        height: height * 0.09,
        backgroundColor: Colors[theme].background,
        padding: 25,
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginBottom: 10,
      }}>
      {/* Show back button only if hiddenBack is false */}
      {!hiddenBack && (
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            backgroundColor: Colors[theme].buttonBackground,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 3,
          }}
          onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" color={Colors[theme].textColor} size={20} />
        </TouchableOpacity>
      )}

      {showMenu && (
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
            // alignSelf: 'flex-end'
          }}
          onPress={openDrawer}>
          <Icon name="profile" color={Colors[theme].textColor} size={30} />
        </TouchableOpacity>
      )}
      {/* {showSetting && (
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
            // alignSelf: 'flex-end'
          }}
          onPress={() => navigation.navigate('AppSettings')}>
          <Icon name="setting" color={Colors[theme].textColor} size={30} />
        </TouchableOpacity>
      )} */}
    </View>
  );
};

export default Header;
