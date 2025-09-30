import React, { useState } from 'react';
import {TouchableOpacity, View, TextInput, Button, Text, StyleSheet, SafeAreaView ,Image, Modal} from 'react-native';
import { auth } from '../utils/firebase';
import toast from '../../helpers/toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import Header from '../components/Header';
import { Colours, width } from '../../constants/Details';
import CustomButton from '../components/CustomButtom';


const ForgotPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.info({ message: 'Please enter your email' });
      return;
    }

    try {
      await sendPasswordResetEmail(auth,email);
      toast.info({ message: 'Password reset email sent successfully!' });
      setModalVisible(true);
    } catch (error) {
      toast.info({ message: error.message || 'Something went wrong' });
    }
  };


    const handleOk = () => {
    setModalVisible(false);
    navigation.navigate('Login'); // Navigate to Login screen after OK
    }

  return (
    <SafeAreaView style={styles.container}>
        <Header navigation={navigation}/>
        <View style={{flex: 1, padding: 20,width: '100%'}}>
<Image
source={require('../../assets/lock.png')}
resizeMode="cover"
style={{width: 150, height:150, alignSelf: 'center', marginTop: 20}}
/>

<Text style={styles.title}>FORGET</Text>
<Text style={styles.title}>PASSWORD</Text>


<TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />


<View style={{
    width: '100%',
    marginVertical: 10,
}}>


  
<CustomButton title='Continue' onPress={handleForgotPassword}/>
</View>


<View style={{
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap:20
}}>
        <Text style={{color: 'gray', fontSize: 16}}>Remeber your password?</Text>
        <Text
          style={{color: Colours.primaryColour, fontWeight: '600', fontSize: 16}}
          onPress={() => navigation.navigate('Login')}>
          Login
        </Text>  
    </View>
        </View>
    


<Modal 
visible={modalVisible}
transparent={true}
animationType="slide"
onRequestClose={() => setModalVisible(false)}>
  <View style={styles.modalBg}>
    <View style={styles.modalView}>
      <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center',color:'black'}}>Check your email</Text>
      <Image
source={require('../../assets/correct.png')}
resizeMode="center"
style={{width: 100, height:100, alignSelf: 'center', marginTop: 20}}
/>
      <Text style={{marginTop: 10, textAlign: 'center',fontSize:17,fontWeight:'500'}}>A password reset link has been sent to your email.</Text>
      <View style={{marginTop: 20, width: '100%'}}>
        {/* <CustomButton title='OK' onPress={handleOk} /> */}
        <TouchableOpacity onPress={handleOk} style={{
            backgroundColor: Colours.primaryColour,
            padding: 12,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
        }}>
            <Text style={{
                color: 'white',
            }}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>


</Modal>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    // justifyContent: 'center',
    backgroundColor: Colours.backgroundColour,
  },
  title: {
    fontSize: 28,
    marginBottom: 5,
    fontWeight: '900',
    textAlign: 'center',
    width:'100%',
    alignSelf: 'center',
    color: 'black',
 
  },
  input: {
    borderBottomWidth:1,
    borderColor: 'gray',
    backgroundColor:'#e1e1e1',
    padding: 12,
    marginVertical: 20,
    // borderRadius: 8,
  },
  modalBg:{flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)'
},
modalView: {
    width: width - 40,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
