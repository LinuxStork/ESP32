import {React} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';

const ButtonComponent = ({label, onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const Auto = ({joints, setJoints, setModifyingSave, serverIp}) => {
  const saveToServer = async (
    saveIndex,
    valueBase,
    valueShoulder,
    valueUpperArm,
    valueHand,
    valueGripper,
    valueGripperTop,
  ) => {
    const url = `http://${serverIp}/saveSteps?save=${saveIndex}&base=${valueBase}&shoulder=${valueShoulder}&upperArm=${valueUpperArm}&hand=${valueHand}&gripper=${valueGripper}&gripperTop=${valueGripperTop}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to send value to server');
      }
    } catch (error) {
      console.error('Error sending value to server:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.tableContainer}>
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
            <TouchableOpacity
              key={index}
              style={styles.row}
              onPress={() => setModifyingSave(index + 1)}>
              <Text style={styles.header}>{index + 1}.</Text>
              <Text style={styles.cell}>{base}</Text>
              <Text style={styles.cell}>{joints.shoulder[index]}</Text>
              <Text style={styles.cell}>{joints.upperArm[index]}</Text>
              <Text style={styles.cell}>{joints.hand[index]}</Text>
              <Text style={styles.cell}>{joints.gripper[index]}</Text>
              <Text style={styles.cell}>{joints.gripperTop[index]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <ButtonComponent
          label="Send to Server"
          onPress={() => {
            (async () => {
              for (let i = 0; i < joints.base.length; i++) {
                saveToServer(
                  i,
                  joints.base[i],
                  joints.shoulder[i],
                  joints.upperArm[i],
                  joints.hand[i],
                  joints.gripper[i],
                  joints.gripperTop[i],
                );
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              ToastAndroid.show('Saves sent to server!', ToastAndroid.SHORT);
            })();
          }}
        />
        <ButtonComponent
          label="Delete saves"
          onPress={() => {
            setJoints({
              base: [],
              shoulder: [],
              upperArm: [],
              hand: [],
              gripper: [],
              gripperTop: [],
            });
            ToastAndroid.show('All saves deleted!', ToastAndroid.SHORT);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
  button: {
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'aqua',
    borderRadius: 6,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Auto;
