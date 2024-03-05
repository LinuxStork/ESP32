import {React} from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Auto = ({serverIp, joints}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.header}>No.</Text>
        <Text style={styles.header}>Base</Text>
        <Text style={styles.header}>Shoulder</Text>
        <Text style={styles.header}>Upper Arm</Text>
        <Text style={styles.header}>Hand</Text>
        <Text style={styles.header}>Gripper</Text>
        <Text style={styles.header}>Gripper Top</Text>
      </View>
      {joints.base.map((base, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.header}>{index + 1}.</Text>
          <Text style={styles.cell}>{base}</Text>
          <Text style={styles.cell}>{joints.shoulder[index]}</Text>
          <Text style={styles.cell}>{joints.upperArm[index]}</Text>
          <Text style={styles.cell}>{joints.hand[index]}</Text>
          <Text style={styles.cell}>{joints.gripper[index]}</Text>
          <Text style={styles.cell}>{joints.gripperTop[index]}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'aqua',
    borderRadius: 6,
  },
  header: {
    flex: 1,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  cell: {
    flex: 1,
    color: 'black',
    textAlign: 'center',
    padding: 5,
  },
});

export default Auto;
