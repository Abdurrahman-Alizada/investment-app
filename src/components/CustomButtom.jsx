import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colours } from '../../constants/Details';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

export default function CustomButton({ title, onPress,buttonheight}) {
  const scale = useSharedValue(1); // For scaling animation
  const backgroundColor = useSharedValue(Colours.primaryColour); // For background color animation

  const gesture = Gesture.Tap()
    .onBegin(() => {
      // Scale down and change background color on press
      scale.value = withSpring(0.95, { damping: 10, stiffness: 100 });
      backgroundColor.value = withTiming(Colours.subButton, { duration: 150 });
    })
    .onFinalize(() => {
      // Scale back and reset background color on release
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      backgroundColor.value = withTiming(Colours.primaryColour, { duration: 150 });
    })
    .onEnd(() => {
      // Trigger the onPress function
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }], // Apply scale animation
      backgroundColor: backgroundColor.value, // Apply background color animation
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.btnCon, buttonStyle,{height:buttonheight||50}]}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  btnCon: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: Colours.primaryColour,
    borderRadius: 26,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});