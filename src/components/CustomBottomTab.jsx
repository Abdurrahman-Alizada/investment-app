import {useColorScheme, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import React from 'react'
import { create, merge } from 'd3';
import BottomTabBarIcon from '../navigator/BottomTabBarIcon';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colours } from '../../constants/Details';
import { Colors } from '../../constants/Colors';
const CustomBottomTab = ({state,descriptors,navigation}) => {

 const colorScheme = useColorScheme();
 const theme = colorScheme === 'dark' ? 'dark' : 'light';
const styles = createStyles(theme);

const {width} = useWindowDimensions();
const MARGIN = 20
const TAB_BAR_WIDTH = width-2*MARGIN
const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length

const translateAnimation = useAnimatedStyle(()=>{
  return{
    transform:[{translateX:withSpring(TAB_WIDTH*state.index)}]
  }
})

  return (
    <View style={[styles.tabBarCOntiner,{width:TAB_BAR_WIDTH,bottom:MARGIN}]}>
      <Animated.View style={[styles.slidingTabContainer,{width:TAB_WIDTH},translateAnimation]}>
        <View style={styles.slidingTab}/>
      </Animated.View>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
       

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, {merge:true});
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            // href={buildHref(route.name, route.params)}
            accessibilityRole='button'
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
            key={route.key}
          >
            <View style={styles.contentContainer}>
              <BottomTabBarIcon route={route.name} isFocused={isFocused}/>
                <Text style={{ color: isFocused ? 'white' : '#a585ff',fontWeight:'700' ,fontSize:12}}>
              {route.name}
            </Text>
            </View>
          
          </Pressable>
        );
      })}
    </View>
  )
}

export default CustomBottomTab

const createStyles = (theme)=>StyleSheet.create({
  tabBarCOntiner:{
    flex:1,
    flexDirection:'row',
    height:60,
    position:'absolute',
    alignSelf:'center',
    backgroundColor:Colors[theme].buttonBackground,
    borderRadius:100,
    alignItems:'center',
    justifyContent:'space-around',
    overflow:'hidden',
    elevation:5
  },
  contentContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    gap:4
  },
  slidingTab:{
    width:75,
    height:55,
    borderRadius:100,
    backgroundColor:'#a585ff'
  },
  slidingTabContainer:{
    ...StyleSheet.absoluteFillObject,
    alignItems:"center",
    justifyContent:'center'
  },
  viewMore: {
    fontSize: 16,
    color: Colours.primaryColour, // Use your app's primary color
    fontWeight: 'bold',
  },
})