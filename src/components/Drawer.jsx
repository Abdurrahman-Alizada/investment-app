import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colours } from '../../constants/Details'

const Drawer = ({navigation}) => {
  return (
    <View style={styles.container}>
   <View style={styles.contentCon}>
    <View style={styles.containerProfile}>
        
    </View>
    <View style={{width:'100%',gap:10,marginTop:10}}>
         <TouchableOpacity onPress={()=>navigation.push('Referral')} style={styles.button}>
        <Text style={styles.buttonTxt}>Refferral Friednds</Text>
    </TouchableOpacity >
    <TouchableOpacity style={styles.button} onPress={()=>navigation.push('DailyRewards')}>
        <Text style={styles.buttonTxt}>Daily Rewards</Text>
    </TouchableOpacity >
    <TouchableOpacity style={styles.button} onPress={()=>navigation.push('Referral')}>
        <Text style={styles.buttonTxt}>Refferral Friednds</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={()=>navigation.push('Referral')}>
        <Text style={styles.buttonTxt}>Refferral Friednds</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={()=>navigation.push('Referral')}>
        <Text style={styles.buttonTxt}>Refferral Friednds</Text>
    </TouchableOpacity>
    </View>
   
   </View>
    </View>
  )
}

export default Drawer

const styles = StyleSheet.create({
    container:{
        ...StyleSheet.absoluteFillObject,
        backgroundColor:'white',
        zIndex:-99
    },
    contentCon:{
        paddingTop:120,
        marginHorizontal:30
    },
    containerProfile:{
        gap:14,
        borderBottomWidth:1,
        borderBottomColor:'black'
    },
    button:{
        padding:10,
        backgroundColor:Colours.subButton,
        borderRadius:8
    },
buttonTxt:{
    color:'white',
    fontWeight:'600'
}
})