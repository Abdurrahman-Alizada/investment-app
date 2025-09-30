import {AppRegistry, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import CountrySelectionScreen from '../screens/CountrySelection';
import SolarPosters from '../screens/SolarPosters';
import CustomBottomTab from './CustomBottomTab';
import AmountInput from '../screens/AmountInput';
import LoginScreen from '../screens/Login';
import ApartmentPosters from '../screens/ApartmentPosters.jsx';
import StockListScreen from '../screens/StocksList.jsx';
import EnterPasswordScreen from '../screens/SignupPassword.jsx';
import Portfolio from '../screens/Portfolio.jsx';
import QuizScreen from '../screens/Questions.jsx';
import DailyRewards from '../screens/DailyRewards.jsx';
import AppSettings from '../screens/AppSettings.jsx';

const Tab = createBottomTabNavigator();

const CustomBottomTabs = props => {
  return <CustomBottomTab {...props} />;
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={CustomBottomTabs}
      screenOptions={{headerShown: false, unmountOnBlur: true}}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{unmountOnBlur: true}}
      />
      <Tab.Screen
        name="Portfolio"
        component={Portfolio}
        options={{unmountOnBlur: true}}
      />
      <Tab.Screen
        name="Rewards"
        component={DailyRewards}
        options={{unmountOnBlur: true}}
      />
      <Tab.Screen
        name="Settings"
        component={AppSettings}
        options={{unmountOnBlur: true}}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({});
