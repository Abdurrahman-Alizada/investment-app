import React from 'react'
import { Text,useColorScheme } from 'react-native'
import { Colors } from '../../constants/Colors'

const CustomHeaderText = ({title}) => {

const colorScheme = useColorScheme();
const theme = colorScheme === "dark" ? "dark" : "light";

  return (
   <Text style={{ 
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
    width:'85%',
    color:Colors[theme].textColor, // Assuming 'theme' is defined in the parent component or passed as a prop
  }}>
    {title}
   </Text>
  )
}

export default CustomHeaderText