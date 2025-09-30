import React from 'react'
import { SafeAreaView,View ,Text,Image,useColorScheme} from 'react-native'
import Header from '../components/Header'
import { Colours, height } from '../../constants/Details'
import CustomHeaderText from '../components/CustomHeaderText'
import CustomButton from '../components/CustomButtom'
import { Colors } from '../../constants/Colors'

// import { Text } from 'react-native-svg'

const DummyMoney = ({navigation}) => {

const colorScheme = useColorScheme();
const theme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
   <SafeAreaView style={{width:"100%",flex:1,backgroundColor:Colors[theme].background}}>
    <Header navigation={navigation}/>
    <View style={{
        width:'100%',
        padding:20,
        backgroundColor:Colors[theme].background,
         height:height*0.91,
        // flex:1,
    }}>
        <View style={{width:'100%',height:height*0.3}}>
           <CustomHeaderText title='Congratulations! You Have Got LKR.100,000 Demo Money!'/>
<Text style={{color:'gray',lineHeight:22}}>
Welcome aboard! As a special gift, we have added LKR.100,000 in virtual funds to your account. Use it to explore, practice, and make the most of your journey!
</Text> 
        </View>
<Image
source={require('../../assets/gift.png')}
style={{
    alignSelf:"center",
    height:height*0.3,
    resizeMode:'contain'
}}
/>
<View style={{justifyContent:"flex-end",height:height*0.2}}>
   <CustomButton title='Get Started' onPress={()=>  navigation.replace("Drawer")}/> 
</View>

    </View>
   </SafeAreaView>
  )
}

export default DummyMoney