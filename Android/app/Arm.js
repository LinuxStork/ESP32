import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import WebView from 'react-native-webview';
import Slider from '@react-native-community/slider';

const SliderComponent = ({
  label,
  actionName,
  initialValue,
  minValue,
  maxValue,
  onValueChange,
}) => {
  const [sliderValue, setSliderValue] = useState(initialValue);

  const handleSliderChange = value => {
    setSliderValue(value);
    onValueChange(actionName, value);
  };

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderText}>
        {label}: {sliderValue}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={1}
        value={sliderValue}
        onValueChange={handleSliderChange}
        minimumTrackTintColor="aqua"
        maximumTrackTintColor="aqua"
        thumbTintColor="aqua"
      />
    </View>
  );
};

const ButtonComponent = ({label, onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const Arm = ({serverIp, joints, updateJoints}) => {
  const [sliderValues, setSliderValues] = useState({
    base: 0,
    shoulder: 0,
    upperArm: 0,
    hand: 0,
    gripper: 0,
    gripperTop: 0,
  });
  const toServer = async (servo, value) => {
    const url = `http://${serverIp}/setServo?servo=${servo}&value=${value}`;

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

  const handleSliderChange = (actionName, value) => {
    setSliderValues(prevValues => ({
      ...prevValues,
      [actionName]: value,
    }));
    toServer(actionName, value);
  };

  return (
    <View style={styles.container}>
      <WebView source={{uri: `http://${serverIp}`}} style={styles.webview} />
      <SliderComponent
        label="Base"
        actionName="base"
        initialValue={0}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Shoulder"
        actionName="shoulder"
        initialValue={0}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Upper Arm"
        actionName="upperArm"
        initialValue={0}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Hand"
        actionName="hand"
        initialValue={0}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Gripper"
        actionName="gripper"
        initialValue={0}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="GripperTop"
        actionName="gripperTop"
        initialValue={0}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <View style={styles.buttonContainer}>
        <ButtonComponent
          label="Save"
          actionName="save"
          onPress={() => {
            toServer('save', 0);
            updateJoints(prevJoints => ({
              base: [...prevJoints.base, sliderValues.base],
              shoulder: [...prevJoints.shoulder, sliderValues.shoulder],
              upperArm: [...prevJoints.upperArm, sliderValues.upperArm],
              hand: [...prevJoints.hand, sliderValues.hand],
              gripper: [...prevJoints.gripper, sliderValues.gripper],
              gripperTop: [...prevJoints.gripperTop, sliderValues.gripperTop],
            }));
          }}
        />
        <ButtonComponent
          label="Play"
          actionName="play"
          onPress={() => toServer('play', 0)}
        />
        <ButtonComponent
          label="Restart"
          actionName="restart"
          onPress={() => toServer('restart', 0)}
        />
      </View>
    </View>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  webview: {
    width: width,
    height: 200,
  },
  sliderContainer: {
    marginVertical: 5,
    alignItems: 'center',
  },
  slider: {
    width: width,
    marginTop: 10,
  },
  sliderText: {
    color: 'black',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
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

export default Arm;
