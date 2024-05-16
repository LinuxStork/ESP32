import {React, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ToastAndroid,
} from 'react-native';

// Glavna komponenta
const Home = ({setServerIp, setModifyingSave, serverIp}) => {
  const [ipInput, setIpInput] = useState('');
  // handker za unos teksta
  const handleInputChange = text => {
    setIpInput(text);
  };
  // Funkcija za postavljanje IP adrese servera
  const handleSetIp = () => {
    setServerIp(ipInput);
    setModifyingSave('nu');
    ToastAndroid.show('Done', ToastAndroid.SHORT);
  };
  // Funkcija za ponovno učitavanje IP adrese servera
  const handleReloadIp = () => {
    setServerIp('nu');
    setTimeout(() => {
      setServerIp(ipInput);
      ToastAndroid.show('Done', ToastAndroid.SHORT);
    }, 1000);
  };

  // Prikaz komponente
  return (
    <View style={styles.container}>
      <Text style={styles.robotArm}>ESP32: Robotska ruka</Text>
      {/* Unos IP adrese*/}
      <TextInput
        style={styles.input}
        placeholder="Enter IP Address"
        onChangeText={handleInputChange}
        value={ipInput}
        placeholderTextColor="gray"
      />
      {/* Gumb za postavljanje IP adrese*/}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (serverIp === '') {
            handleSetIp();
          } else if (serverIp !== '') {
            handleReloadIp();
          }
        }}>
        <Text style={styles.buttonText}>
          {serverIp === '' ? 'Set IP' : 'Reload IP '}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Stiliziranje komponente
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
