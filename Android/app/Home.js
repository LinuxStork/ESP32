import {React, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

const Home = ({setServerIp}) => {
  const [ipInput, setIpInput] = useState('');

  const handleInputChange = text => {
    setIpInput(text);
  };

  const handleSetIp = () => {
    setServerIp(ipInput);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.robotArm}>ESP32: Robotska ruka</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter IP Address"
        onChangeText={handleInputChange}
        value={ipInput}
        placeholderTextColor="gray"
      />
      <TouchableOpacity style={styles.button} onPress={handleSetIp}>
        <Text style={styles.buttonText}>Set IP</Text>
      </TouchableOpacity>
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
  robotArm: {
    position: 'absolute',
    top: 100,
    fontSize: 25,
    fontWeight: 'bold',
    color: 'gray',
    textShadowColor: 'aqua',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  input: {
    height: 50,
    width: 300,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    borderColor: 'cyan',
    color: 'black',
    backgroundColor: 'white',
    textAlignVertical: 'center',
  },
  button: {
    height: 50,
    width: 120,
    borderWidth: 2,
    padding: 8,
    borderRadius: 6,
    borderColor: 'cyan',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
