import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
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

  useEffect(() => {
    setSliderValue(initialValue);
  }, [initialValue]);

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
        value={initialValue}
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

const Arm = ({
  serverIp,
  joints,
  setJoints,
  setModifyingSave,
  modifyingSave,
}) => {
  const [sliderValues, setSliderValues] = useState({
    base: 0,
    shoulder: 0,
    upperArm: 0,
    hand: 0,
    gripper: 0,
    gripperTop: 0,
  });

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (modifyingSave !== 'nu') {
      const index = modifyingSave - 1;
      if (!isNaN(index) && index >= 0 && index < joints.base.length) {
        setSliderValues({
          base: joints.base[index],
          shoulder: joints.shoulder[index],
          upperArm: joints.upperArm[index],
          hand: joints.hand[index],
          gripper: joints.gripper[index],
          gripperTop: joints.gripperTop[index],
        });
        toServer('base', joints.base[modifyingSave - 1]);
        toServer('shoulder', joints.shoulder[modifyingSave - 1]);
        toServer('upperArm', joints.upperArm[modifyingSave - 1]);
        toServer('hand', joints.hand[modifyingSave - 1]);
        toServer('gripper', joints.gripper[modifyingSave - 1]);
        toServer('gripperTop', joints.gripperTop[modifyingSave - 1]);
      }
    }
  }, [
    modifyingSave,
    joints.base,
    joints.shoulder,
    joints.upperArm,
    joints.hand,
    joints.gripper,
    joints.gripperTop,
    toServer,
  ]);

  const toServer = useCallback(
    async (servo, value) => {
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
    },
    [serverIp],
  );

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
      <Text style={styles.sliderText}>
        {modifyingSave === 'nu'
          ? 'Currently Not Modifying Save'
          : 'Currently Modifying ' + modifyingSave + '. Save'}
      </Text>
      <SliderComponent
        label="Base"
        actionName="base"
        initialValue={sliderValues.base}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Shoulder"
        actionName="shoulder"
        initialValue={sliderValues.shoulder}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Upper Arm"
        actionName="upperArm"
        initialValue={sliderValues.upperArm}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Hand"
        actionName="hand"
        initialValue={sliderValues.hand}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="Gripper"
        actionName="gripper"
        initialValue={sliderValues.gripper}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <SliderComponent
        label="GripperTop"
        actionName="gripperTop"
        initialValue={sliderValues.gripperTop}
        minValue={-90}
        maxValue={90}
        onValueChange={handleSliderChange}
      />
      <View style={styles.buttonContainer}>
        <ButtonComponent
          label="Save"
          actionName="save"
          onPress={() => {
            //toServer('save', 0);

            setJoints(prevJoints => {
              if (modifyingSave !== 'nu') {
                ToastAndroid.show(
                  'Saved to save: ' + modifyingSave + '. ',
                  ToastAndroid.SHORT,
                );
                const index = modifyingSave - 1;
                return {
                  base: prevJoints.base.map((value, i) =>
                    i === index ? sliderValues.base : value,
                  ),
                  shoulder: prevJoints.shoulder.map((value, i) =>
                    i === index ? sliderValues.shoulder : value,
                  ),
                  upperArm: prevJoints.upperArm.map((value, i) =>
                    i === index ? sliderValues.upperArm : value,
                  ),
                  hand: prevJoints.hand.map((value, i) =>
                    i === index ? sliderValues.hand : value,
                  ),
                  gripper: prevJoints.gripper.map((value, i) =>
                    i === index ? sliderValues.gripper : value,
                  ),
                  gripperTop: prevJoints.gripperTop.map((value, i) =>
                    i === index ? sliderValues.gripperTop : value,
                  ),
                };
              } else {
                ToastAndroid.show('Saved to new save', ToastAndroid.SHORT);
                return {
                  base: [...prevJoints.base, sliderValues.base],
                  shoulder: [...prevJoints.shoulder, sliderValues.shoulder],
                  upperArm: [...prevJoints.upperArm, sliderValues.upperArm],
                  hand: [...prevJoints.hand, sliderValues.hand],
                  gripper: [...prevJoints.gripper, sliderValues.gripper],
                  gripperTop: [
                    ...prevJoints.gripperTop,
                    sliderValues.gripperTop,
                  ],
                };
              }
            });
          }}
        />
        <ButtonComponent
          label="Stop Modifying"
          onPress={() => {
            setModifyingSave('nu');
            ToastAndroid.show(
              'Stopped modifying save: ' + modifyingSave + '.',
              ToastAndroid.SHORT,
            );
          }}
        />
        <ButtonComponent
          label={isPlaying ? 'Stop' : 'Play'}
          onPress={() => {
            if (isPlaying) {
              toServer('stop', 0);
            } else {
              toServer('play', 0);
            }
            setIsPlaying(!isPlaying);
          }}
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
