import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomRadioButton = ({ question, options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = (option) => {
    setSelectedOption(option);
    if (onSelect) onSelect(option);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{question}</Text>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
          }}
          onPress={() => handleSelect(option)}
        >
          <Icon
            name={selectedOption === option ? 'radiobox-marked' : 'radiobox-blank'}
            size={24}
            color={selectedOption === option ? '#007BFF' : 'gray'}
          />
          <Text style={{ marginLeft: 10, fontSize: 16 }}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CustomRadioButton;
