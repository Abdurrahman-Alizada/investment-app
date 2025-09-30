import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText = (props) => {
  return <Text style={[styles.defaultStyle, props.style]}>{props.children}</Text>;
};

const styles = StyleSheet.create({
    defaultStyle: {
      fontFamily: 'Roboto Slab', // Correct name, without file extension
    },
  });
  

export default CustomText;
