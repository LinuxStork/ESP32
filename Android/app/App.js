import * as React from 'react';
import {useState} from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Arm from './Arm';
import Home from './Home';

const Tab = createBottomTabNavigator();

export default function App() {
  const [serverIp, setServerIp] = useState('');

  return (
    <NavigationContainer style={styles.container}>
      <Tab.Navigator tabBarOptions={styles.tabNavigator}>
        <Tab.Screen name="Home" options={{headerShown: false}}>
          {() => <Home setServerIp={setServerIp} />}
        </Tab.Screen>
        <Tab.Screen name="Arm" options={{headerShown: false}}>
          {() => <Arm serverIp={serverIp} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabNavigator: {
    activeTintColor: 'aqua',
    inactiveTintColor: 'gray',
  },
});
