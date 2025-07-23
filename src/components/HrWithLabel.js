import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const HrWithLabel = ({customStyle, label}) => {
  return (
    <View style={[styles.lineContainer, customStyle]}>
      <View style={styles.line} />
      <View style={styles.textLabelContainer}>
        <Text style={styles.textLabel}>{label}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'grey',
  },
  textLabelContainer: {
    paddingHorizontal: 10,
    backgroundColor: 'transparent', // Set to your container's background color
  },
  textLabel: {
    fontSize: 16,
    color: 'grey',
  },
});

export default HrWithLabel;
