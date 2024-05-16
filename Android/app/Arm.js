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

// Komponenta za klizač
const SliderComponent = ({
  label,
  actionName,
  initialValue,
  minValue,
  maxValue,
  onValueChange,
}) => {
  const [sliderValue, setSliderValue] = useState(initialValue);

  // Postavljanje početne vrijednosti klizača
  useEffect(() => {
    setSliderValue(initialValue);
  }, [initialValue]);

  // Funkcija za mjenjanje vrijednosti klizača
  const handleSliderChange = value => {
    setSliderValue(value);
    onValueChange(actionName, value);
  };

  // Vraća komponentu s klizačem i tekstom.
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

// Komponenta za gumb
const ButtonComponent = ({label, onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

// Glavna komponenta
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

  // Dohvaćanuje vrijednosti zglobova s poslužitelja u ovom slučaju ESP32
  useEffect(() => {
    const socket = new WebSocket(`ws://${serverIp}/ws`);

    socket.addEventListener('message', event => {
      const [joint, value, step] = event.data.split(' ');
      setSliderValues(prevValues => ({
        ...prevValues,
        [joint]: Number(value),
      }));
    });

    return () => socket.close();
  }, [serverIp, isPlaying]);

  // Dohvaćanuje vrijednosti zglobova s poslužitelja u ovom slučaju ESP32
  useEffect(() => {
    const fetchJointValues = async () => {
      const url = `http://${serverIp}/jointsValues`;

      try {
        const response = await fetch(url);
        const data = await response.text();
        const [base, shoulder, upperArm, hand, gripper, gripperTop] = data
          .split(' ')
          .map(Number);

        setSliderValues({
          base,
          shoulder,
          upperArm,
          hand,
          gripper,
          gripperTop,
        });
      } catch (error) {
        console.error('Error fetching joint values:', error.message);
      }
    };

    fetchJointValues();
  }, [serverIp]);

  // Ažuriranje vrijednosti klizača kada se mijenja spremljena vrijednost
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

  // Funkcija za slanje na poslužitelj u ovom slučaju ESP32
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

  // Funkcija za obradu promjene vrijednosti klizača
  const handleSliderChange = (actionName, value) => {
    setSliderValues(prevValues => ({
      ...prevValues,
      [actionName]: value,
    }));
    toServer(actionName, value);
  };

  return (
    <View style={styles.container}>
      <WebView // WebView za prikaz 3D vizualizacije robotske ruke
        source={{uri: `http://${serverIp}`}}
        style={styles.webview}
      />
      <Text style={styles.sliderText}>
        {/* Tekst koji prikazuje dali se save mijenja i ako da koji se mijenja.
        ? : ternarni operator (skraćeni oblik if else naredbe) */}
        {modifyingSave === 'nu'
          ? 'Currently Not Modifying Save'
          : 'Currently Modifying ' + modifyingSave + '. Save'}
      </Text>
      {/* Komponente za klizače */}
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
        {/* Komponente za gumbe */}
        <ButtonComponent
          //Gumb za spremanje
          label="Save"
          actionName="save"
          onPress={() => {
            //toServer('save', 0);

            // Spremanje vrijednosti zglobova u joints prop prenesen iz App komponente
            setJoints(prevJoints => {
              //Ako se mijenja postojeći save
              if (modifyingSave !== 'nu') {
                ToastAndroid.show(
                  'Saved to save: ' + modifyingSave + '. ',
                  ToastAndroid.SHORT,
                );
                const index = modifyingSave - 1;
                // Vraća se novi objekt s ažuriranim vrijednostima na indexu koji se mijenja
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
                // Ako se stvara novi save
                ToastAndroid.show('Saved to new save', ToastAndroid.SHORT);
                // Vraća se novi objekt s dodanim vrijednostima na kraju polja
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
          //Gumb za zaustavljanje spremanja
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
          //Gumb za pokretanje ili zaustavljanje automatitiranih pokreta
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

// Stiliziranje komponenti
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
