import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3333ff',
    padding: 10,
    borderRadius: 25,
    width: '80%',
    marginTop: 30,
    marginBottom: 0,
    height: 44,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomButton;
