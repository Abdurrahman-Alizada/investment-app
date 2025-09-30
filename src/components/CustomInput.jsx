import {React, useState} from 'react';
import {View, TextInput, StyleSheet, useColorScheme} from 'react-native';
import {Colors} from '../../constants/Colors';
const CustomInput = ({value, onChangeText, placeholder, keyboardType}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={{
        width: '100%',
        height: 50,
      }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[styles.phoneInput, isFocused && styles.focusedBorder]}
        placeholderTextColor="#9DACBD"
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    phoneInput: {
      flex: 1,
      padding: 10,
      fontSize: 16,
      backgroundColor: Colors[theme].inputBackground,
      borderRadius: 8,
      color: Colors[theme].textColor,
    },
    focusedBorder: {
      borderColor: Colors[theme].gray, // Change border color when focused
      borderWidth: 1,
      color: Colors[theme].textColor,
    },
  });

export default CustomInput;
