import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const CloseButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={require('../assets/close.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 25,
    right: 25,
  },
  icon: {
    width: 15, 
    height: 15, 
  },
});

export default CloseButton;
