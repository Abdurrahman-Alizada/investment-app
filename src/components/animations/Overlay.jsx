import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAnimatedStyle } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

const Overlay = ({active}) => {

const animatedStyle = useAnimatedStyle(()=>{
    return{
        display:active.value ?'flex' :'none'
    }
})

  return (
    <Animated.View style={[styles.container,animatedStyle]}>
     <Pressable  style={styles.container} onPress={()=>active.value=false}/>
    </Animated.View>
  )
}

export default Overlay

const styles = StyleSheet.create({
    container:{
        ...StyleSheet.absoluteFillObject
    }
})