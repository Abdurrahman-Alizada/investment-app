import React from 'react';
import {View, StyleSheet, Image, ActivityIndicator, Text} from 'react-native';
// import { Text } from 'react-native-gesture-handler';

const LoaderScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        <Text>hii</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 10,
  },
  loaderContainer: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: 80,
    height: 80,
  },
});

export default LoaderScreen;
