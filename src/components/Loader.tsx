import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import {Colors} from '../../constants/Colors';

export default function LoaderAnim() {
  console.log('LoaderAnim component mounted');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={'large'} color={'black'} />
      </View>
    </SafeAreaView>
  );
}

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
    zIndex: 1000,
  },
  loaderContainer: {
    width: '15%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieStyle: {
    width: '200%',
    height: '150%',
    borderRadius: 50,
    color: Colors.dark.primaryColour,
  },
});
