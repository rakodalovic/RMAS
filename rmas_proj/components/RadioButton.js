import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

const RadioButton = ({ value, label, selected, onSelect }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5 }}>
    <TouchableOpacity onPress={onSelect} style={{ width: 20, margin:5, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
      {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'black' }} />}
    </TouchableOpacity>
    <Text>{label}</Text>
  </View>
);

export default RadioButton;
