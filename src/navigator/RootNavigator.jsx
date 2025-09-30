import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import SplashScreen from '../screens/Splash.jsx';
import Onboarding from '../screens/Onboarding.jsx';
import CountrySelectionScreen from '../screens/CountrySelection.jsx';
import PhoneNumberScreen from '../screens/PhoneNumber.jsx';
import EnterEmailScreen from '../screens/EmailInput.jsx';
import EnterPasswordScreen from '../screens/SignupPassword.jsx';
import Home from '../screens/Home.jsx';
import LoginScreen from '../screens/Login.jsx';
import QuizScreen from '../screens/Questions.jsx';
import DummyMoney from '../screens/DummyMoney.jsx';
import AmountInput from '../screens/AmountInput.jsx';
import SolarPosters from '../screens/SolarPosters.jsx';
import SolarDetails from '../screens/SolarDetails.jsx';
import ApartmentPosters from '../screens/ApartmentPosters.jsx.jsx';
import BottomTabNavigator from '../components/BottomTabNavigator.jsx';
import OTPVerification from '../screens/OTPVerification.jsx';
import PendingVerificationScreen from '../screens/EmailVerification.jsx';
import ApartmentDetails from '../screens/ApartmentDetails.jsx';
import GoldBuyingScreen from '../screens/GoldPurchase.jsx';
import Referral from '../screens/Referral.jsx';
import EnterReferral from '../screens/EnterReferral.jsx';
import DailyRewards from '../screens/DailyRewards.jsx';

import InvestmentListScreen from '../screens/InvestmentList.jsx';
import InvestmentDetailsScreen from '../screens/InvestmentDetails.jsx';
import StockListScreen from '../screens/StocksList.jsx';
import SettingsScreen from '../screens/Settings.jsx';
import BuyStockScreen from '../screens/BuyStockScreen.jsx';
import AppSettings from '../screens/AppSettings.jsx';
import AdTest from '../screens/AdTest.jsx';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.jsx';
import DeleteAccount from '../screens/DeleteAccount.jsx';
import ConfirmAccountDelete from '../screens/ConfirmAccountDelete.jsx';
import EnterName from '../screens/EnterName.jsx';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Tabs">
      <Drawer.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{headerShown: false}}
      />
      <Drawer.Screen
        name="Referral"
        component={Referral}
        options={{headerShown: false}}
      />
      <Drawer.Screen
        name="DailyRewards"
        component={DailyRewards}
        options={{headerShown: false}}
      />
    </Drawer.Navigator>
  );
}
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    // <NavigationContainer>
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CountrySelection"
        component={CountrySelectionScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PhoneNumber"
        component={PhoneNumberScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerification}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EnterEmail"
        component={EnterEmailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PendingVerification"
        component={PendingVerificationScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EnterPassword"
        component={EnterPasswordScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />

      {/* 👉 Drawer-ஐ Stack screen-ஆ சேர்க்க */}
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{headerShown: false}}
      />

      {/* Stack-only Screens */}

      <Stack.Screen
        name="Questions"
        component={QuizScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DummyMoney"
        component={DummyMoney}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="EnterAmount"
        component={AmountInput}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EnterName"
        component={EnterName}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SolarPosters"
        component={SolarPosters}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SolarDetails"
        component={SolarDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ApartmentPosters"
        component={ApartmentPosters}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ApartmentDetails"
        component={ApartmentDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="GoldPurchase"
        component={GoldBuyingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StocksList"
        component={StockListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EnterReferral"
        component={EnterReferral}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="InvestmenList"
        component={InvestmentListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="InvestmentDetails"
        component={InvestmentDetailsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BuyStock"
        component={BuyStockScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AppSettings"
        component={AppSettings}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AdTest"
        component={AdTest}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ForgetPassword"
        component={ForgotPasswordScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccount}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ConfirmAccountDelete"
        component={ConfirmAccountDelete}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
    // </NavigationContainer>
  );
}

// const RootNavigator = () => {
//   return (
//     <Drawer.Navigator
//       initialRouteName="Tabs"
//       screenOptions={{
//         drawerStyle: {
//           backgroundColor: '#fff', // டிராயர் பின்னணி நிறம்
//           width: 240, // டிராயர் அகலம்
//         },
//         drawerActiveTintColor: '#000', // ஆக்டிவ் ஐட்டம் நிறம்
//         drawerInactiveTintColor: '#333', // இன்ஆக்டிவ் ஐட்டம் நிறம்
//       }}
//     >
//       <Drawer.Screen
//         name="Tabs"
//         component={MainStack}
//         options={{
//           headerShown: false,
//           drawerLabel: 'Home' // தமிழில் மெனு ஐட்டம்
//         }}
//       />
//       {/* மற்ற டிராயர் ஐட்டங்களை இங்கே சேர்க்கலாம் */}
//       <Drawer.Screen
//         name="Referral"
//         component={Referral}
//         options={{
//           // drawerLabel: 'Settings',
//           headerShown:false
//         }}
//       />
//       <Drawer.Screen
//         name="DailyRewards"
//         component={DailyRewards}
//         options={{
//           // drawerLabel: 'Settings',
//           headerShown:false
//         }}
//       />

//       {/* <Drawer.Screen
//         name="AppSettings"
//         component={AppSettings}
//         options={{
//           // drawerLabel: 'Settings',
//           headerShown:false
//         }}
//       /> */}

//     </Drawer.Navigator>
//   );
// }

// export default RootNavigator
