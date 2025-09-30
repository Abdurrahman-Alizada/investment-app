import React, { useCallback, useEffect, useState,useRef } from 'react';
import {
  View,
  Text,
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Colours } from '../../constants/Details';

const Toast = () => {
  const [message, setMessage] = useState(null);
  const [duration, setDuration] = useState(2000); // Default duration
  const timeOutRef = useRef(null);

  const animatedOpacity = useSharedValue(0); // For opacity animation

  // Animated style for the toast
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
    };
  });

  // Function to close the toast
  const closeToast = useCallback(() => {
    animatedOpacity.value = withTiming(0, { duration: 300 }); // Fade out animation
    setTimeout(() => {
      setMessage(null); // Hide the toast after the animation
    }, 300); // Wait for the fade-out animation to complete
  }, [animatedOpacity]);

  // Function to show the toast
  const showToast = useCallback(
    (newMessage, newDuration = 2000) => {
      setMessage(newMessage);
      setDuration(newDuration);
      animatedOpacity.value = withTiming(1, { duration: 300 }); // Fade in animation

      // Automatically close the toast after the specified duration
      if (timeOutRef.current) {
        clearTimeout(timeOutRef.current);
      }
      timeOutRef.current = setTimeout(() => {
        closeToast();
      }, newDuration);
    },
    [animatedOpacity, closeToast]
  );

  // Listen for toast events
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('SHOW_TOAST_MESSAGE', data => {
      showToast(data.message, data.duration);
    });

    return () => {
      listener.remove(); // Clean up the listener
    };
  }, [showToast]);

  // Clean up the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeOutRef.current) {
        clearTimeout(timeOutRef.current);
      }
    };
  }, []);

  // Don't render the toast if there's no message
  if (!message) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '5%',
    left: '5%',
    right: '5%',
    alignItems: 'center',
    zIndex: 1,
    elevation: 5,
    shadowColor: Colours.primaryColour,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 5.22,
    shadowRadius: 5.22,
    
  },
  toast: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
  },
  text: {
    color: 'black',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Toast;