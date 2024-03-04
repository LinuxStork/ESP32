import {React} from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Auto = ({serverIp, joints}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.ip}>Base: {joints.base.join(', ')}</Text>
      <Text style={styles.ip}>Shoulder: {joints.shoulder.join(', ')}</Text>
      <Text style={styles.ip}>Upper Arm: {joints.upperArm.join(', ')}</Text>
      <Text style={styles.ip}>Hand: {joints.hand.join(', ')}</Text>
      <Text style={styles.ip}>Gripper: {joints.gripper.join(', ')}</Text>
      <Text style={styles.ip}>Gripper Top: {joints.gripperTop.join(', ')}</Text>
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
