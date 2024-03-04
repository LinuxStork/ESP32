import {React} from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Auto = ({serverIp}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.ip}>IP: {serverIp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  ip: {
    color: 'red',
  },
});

export default Auto;
