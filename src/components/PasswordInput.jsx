import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, useColorScheme } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "../../constants/Colors";

const PasswordInput = ({ placeholder, value, onChangeText }) => {

const colorScheme = useColorScheme();
const theme = colorScheme === "dark" ? "dark" : "light";

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: Colors[theme].background, // Use theme-based background color
      }}
    >
      <TextInput
        style={{
          flex: 1,
          fontSize: 16,
          paddingVertical: 10,
        }}
        secureTextEntry={!isPasswordVisible}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
        <Ionicons
          name={isPasswordVisible ? "eye" : "eye-off"}
          size={24}
          color="#777"
        />
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
