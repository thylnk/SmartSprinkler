import Slider from '@react-native-community/slider';
import React, { useState, useEffect } from 'react';
import { Switch, View, Text, FlatList, Button, PermissionsAndroid, StyleSheet, ScrollView } from 'react-native';
import RNBluetoothClassic, {
  BluetoothEventType,
  BluetoothDevice,
} from "react-native-bluetooth-classic";

const requestPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
    title: "Request for Location Permission",
    message: "Bluetooth Scanner requires access to Fine Location Permission",
    buttonNeutral: "Ask Me Later",
    buttonNegative: "Cancel",
    buttonPositive: "OK"
  }
  );
  return (granted === PermissionsAndroid.RESULTS.GRANTED);
}

// BlueetoothScanner does:
// - access/enable bluetooth module
// - scan bluetooth devices in the area
// - list the scanned devices
const Bluetooth = () => {
  // const { status } = route.params;

  const [isEnabled, setIsEnabled] = useState(false);
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isEngine, setIsEngine] = useState(false);
  const [connection, setConnection] = useState(null);
  const [water, setWater] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [soil, setSoil] = useState(0);

  const HC05 = '00:20:12:08:F0:B7';
  // const test = '34:82:C5:F5:6F:B3';
  const test = HC05;

  // check bluetooth permission
  const checkPermission = async () => {
    try {
      const available = await RNBluetoothClassic.isBluetoothAvailable();
      console.log('Check permission: ', available);
      return available;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // check bluetooth available
  const checkIsAvailable = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      setIsEnabled(enabled)
      return enabled;
    } catch (err) {
      console.log(err);
      setIsEnabled(false)
      return false;
    }
  }

  const initializeRead = async () => {
    if (connection) {
      try {
        const string = await RNBluetoothClassic.readFromDevice(test)
        console.log("receive:", string)
        if (string) {
          const arr = +string.split('!').slice(1, -1);
          setSoil(arr[0])
          setWater(arr[1])
          setSpeed(arr[2])
        }
      } catch (error) {
        console.log("Receive data fail: ", error)
      }
    }
  }

  const writeToDevice = async (data) => {
    if (connection) {
      try {
        console.log(data);
        const isOK = RNBluetoothClassic.writeToDevice(test, data, 'utf8')
        if (isOK) {
          console.log('Write OK ', data);
        }
      } catch (error) {
        console.log('Write to device: ', error);
      }
    } else {
      alert('Check connection!')
    }
  }

  const connect = async () => {
    try {
      console.log(device.address);
      let connection = await RNBluetoothClassic.isDeviceConnected(test);
      if (!connection) {
        connection = await RNBluetoothClassic.connectToDevice(test, {
          CONNECTOR_TYPE: "rfcomm",
          DELIMITER: "\n",
          DEVICE_CHARSET: Platform.OS === "ios" ? 1536 : "utf-8",
        });
      }
      setConnection(connection);
    } catch (error) {
      console.log('connect failed', error)
    }
  }

  const pairedConnections = async () => {
    let devices = []
    try {
      console.log('Starting');
      devices = await RNBluetoothClassic.getBondedDevices();
      console.log(devices);

      if (Array.isArray(devices)) {
        devices.forEach((item) => {
          if (item.id === test) {
            console.log('OK paired');
            setDevice(item)
            connect()
            if (connection) {
              initializeRead()
              setIsConnected(true)
            }
            return;
          }
        })
      }
    } catch (error) {
      console.log(error);
      setIsConnected(false)
      alert('Check your device \'s connection!')
    } finally {
      console.log('Stopped');
    }
  }


  const onStateChanged = (stateChangedEvent) => {
    console.log(stateChangedEvent);
    setIsEnabled(stateChangedEvent.enabled)
  }

  // check state of bluetooth: enabled or disabled
  const enabledSubscription = () => RNBluetoothClassic.onBluetoothEnabled((event) => onStateChanged(event));
  const disabledSubscription = () => RNBluetoothClassic.onBluetoothDisabled((event) => onStateChanged(event));

  useEffect(() => {
    () => {
      checkIsAvailable();
    }
  }, [enabledSubscription(), disabledSubscription(), checkIsAvailable(), connection, initializeRead()]);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View>
        <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '700', paddingVertical: 30 }}>SMART SPRINKLER</Text>
      </View>
      <View style={{ flex: 1, padding: 10 }}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.text}>Bluetooth</Text>
          </View>
          <View>
            <Text>
              {`${isEnabled ? 'ON' : 'OFF'}`}
            </Text>
          </View>
        </View>

        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.text}>HC-05</Text>
          </View>
          <Button title={`${isConnected ? 'ON' : 'OFF'}`} onPress={pairedConnections} />
        </View>

        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.text}>Engine</Text>
          </View>
          <View>
            <Text
            >{`${isEngine ? 'ON' : 'OFF'}`}</Text>
          </View>
        </View>

        <View style={[styles.rowWrapper]}>
          <Text style={[styles.text, { paddingLeft: 30 }]}>Soil moisture</Text>
          <Text style={[styles.text, { paddingRight: 30 }]}>{soil}</Text>
        </View>

        <View
          style={[
            styles.secondWrapper,
            { alignItems: 'flex-start', justifyContent: 'center' },
          ]}>
          <Text style={[styles.text, { paddingLeft: 30 }]}>Engine Speed</Text>
          <View style={{ paddingHorizontal: 10, width: '100%' }}>
            <Slider
              style={{ width: '100%', height: 30 }}
              minimumValue={0}
              step={1}
              maximumValue={100}
              maximumTrackTintColor="#02040"
              minimumTrackTintColor="green"
              thumbTintColor="green"
              value={speed}
              onSlidingComplete={(value) => { writeToDevice(value + '') }}
            />
          </View>
        </View>

        <View
          style={[
            styles.secondWrapper,
            { alignItems: 'flex-start', justifyContent: 'center' },
          ]}>
          <Text style={[styles.text, { paddingLeft: 30 }]}>Water Speed</Text>
          <View style={{ paddingHorizontal: 10, width: '100%' }}>
            <Slider
              style={{ width: '100%', height: 30 }}
              minimumValue={0}
              step={1}
              maximumValue={100}
              maximumTrackTintColor="#02040"
              minimumTrackTintColor="green"
              thumbTintColor="green"
              value={water}
              onSlidingComplete={(value) => { writeToDevice(value + '') }}
            />
          </View>
        </View>

      </View>
    </View >
  );
};

const styles = StyleSheet.create(
  {
    headerContainer: {
      width: '100%',
      height: 60,
      flexDirection: 'row',
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(132, 183, 143, 0.2)',
      borderRadius: 20,
      marginBottom: 20,
    },

    rowWrapper: {
      height: 60,
      display: "flex",
      flexDirection: "row",
      backgroundColor: 'rgba(132, 183, 143, 0.2)',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
    },

    wrapper: {
      width: 144,
      height: 60,
      backgroundColor: 'rgba(132, 183, 143, 0.2)',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },

    secondWrapper: {
      height: 75,
      backgroundColor: 'rgba(132, 183, 143, 0.2)',
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 30,
    },

    text: {
      fontFamily: 'Lato_700Bold',
      fontSize: 20,
      paddingVertical: 4,
    },

    smallText: {
      fontFamily: 'Lato_700Bold_Italic',
      fontSize: 18,
      paddingVertical: 4,
      color: '#020202'
    },

    btnActive: {
      backgroundColor: '#62CB79',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.35,
      shadowRadius: 3.84,
      elevation: 8,
    },

    btnUnActive: {
      backgroundColor: '#7C9F83',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.35,
      shadowRadius: 3.84,
      elevation: 8,
    }
  }
)

export default Bluetooth;