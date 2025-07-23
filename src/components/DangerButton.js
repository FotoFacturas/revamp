import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';

export default function DangerButton(props) {
  return (
    <>
      <View style={buttonContainerStyle}>
        <TouchableOpacity onPress={props.onPress}>
          <Text style={buttonTextStyle}>{props.value}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const buttonContainerStyle = {
  marginTop: 24,
  alignItems: 'center',
};

const buttonTextStyle = {
  color: 'rgb(255, 0, 0)',
  fontSize: 20,
  textAlign: 'center',
};
