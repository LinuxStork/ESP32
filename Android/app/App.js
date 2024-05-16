import * as React from 'react';
import {useState} from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auto from './Auto';
import Arm from './Arm';
import Home from './Home';

// Kreiranje navigacije
const Tab = createBottomTabNavigator();

// Glavna komponenta
const App = () => {
  // Stanje za IP adresu servera
  const [serverIp, setServerIp] = useState('');
  // Stanje za modifikaciju spremanja
  const [modifyingSave, setModifyingSave] = useState('');
  // Stanje za zglobove
  const [joints, setJoints] = useState({
    base: [],
    shoulder: [],
    upperArm: [],
    hand: [],
    gripper: [],
    gripperTop: [],
  });

  // Učitavanje zglobova iz memorije
  React.useEffect(() => {
    loadJoints().then(setJoints);
  }, []);

  // Funkcija za učitavanje zglobova iz memorije (AsyncStorage)
  const loadJoints = async () => {
    const storedJoints = await AsyncStorage.getItem('joints');
    return storedJoints
      ? JSON.parse(storedJoints)
      : {
          base: [],
          shoulder: [],
          upperArm: [],
          hand: [],
          gripper: [],
          gripperTop: [],
        };
  };

  // Spremanje zglobova u memoriju (AsyncStorage)
  React.useEffect(() => {
    AsyncStorage.setItem('joints', JSON.stringify(joints));
  }, [joints]);

  return (
    // Navigacija između komponenti/zaslona
    <NavigationContainer style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: 'aqua',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {display: 'flex'},
        }}>
        <Tab.Screen name="Home" options={{headerShown: false}}>
          {() => (
            <Home
              // Prijenos stanja IP adrese servera i modifikaciju spremanja
              setServerIp={setServerIp}
              serverIp={serverIp}
              setModifyingSave={setModifyingSave}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Arm" options={{headerShown: false}}>
          {() => (
            <Arm
              // Prijenos stanja za IP adresu servera, zglobova i modifikaciju spremanja
              serverIp={serverIp}
              joints={joints}
              setJoints={setJoints}
              setModifyingSave={setModifyingSave}
              modifyingSave={modifyingSave}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Auto" options={{headerShown: false}}>
          {() => (
            <Auto
              // Prijenos stanja za IP adresu servera, zglobove i modifikaciju spremanja
              serverIp={serverIp}
              joints={joints}
              setJoints={setJoints}
              setModifyingSave={setModifyingSave}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Stiliziranje komponente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
