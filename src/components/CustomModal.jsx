import React from 'react';
import {useColorScheme, View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or any other icon library
import { Colours } from '../../constants/Details';
import { Colors } from '../../constants/Colors';

const CustomModal = ({
  visible,
  title,
  iconName,
  subtitle,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onClose,
}) => {


const colorScheme = useColorScheme();
const theme = colorScheme === 'dark' ? 'dark' : 'light'; // Determine
styles = createStyles(theme);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            {iconName && <Icon name={iconName} size={30} color="#3498db" style={styles.icon} />}
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          {subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={[styles.buttonText,{color:Colours.primaryColour}]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors[theme].buttonBackground,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Adjust width as needed
  },
  header: {
    // flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 15,
  },
  icon: {
    // marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors[theme].textColor,
  },
  modalSubtitle: {
    fontSize: 16,
    // marginBottom: 20,
    textAlign: 'center',
    color: Colors[theme].textColor,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor:Colours.primaryColour,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    width:'45%'
  },
  cancelButton: {
    // backgroundColor: '#e74c3c',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    // elevation: 2,
    borderWidth:0.5,
    borderColor:Colors[theme].textColor,
    width:'45%'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomModal;