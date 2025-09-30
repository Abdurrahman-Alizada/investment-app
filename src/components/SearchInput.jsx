import React from 'react';
import { View, TextInput,useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/Colors';

const SearchInput = ({ placeholder, value, onSearch }) => {


  const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";
    // const styles = createStyles(theme);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 45,
        backgroundColor: Colors[theme].background ,
      }}
    >
      <Icon name="search" size={20} color={Colors[theme].gray} />
      <TextInput
        style={{
          flex: 1,
          marginLeft: 10,
          fontSize: 16,
        }}
        placeholder={placeholder}
        value={value} // Pass value here
        onChangeText={(text) => onSearch(text)} // Trigger search function
      />
    </View>
  );
};

export default SearchInput;
