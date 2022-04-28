import Slider from '@react-native-community/slider';
import React, { useState, useEffect } from 'react';
import { BackHandler, Touchable, TouchableHighlight, TouchableOpacity } from 'react-native';
import { Switch, View, Text, FlatList, Button, PermissionsAndroid, StyleSheet, ScrollView } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export const manager = new BleManager();

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
  const [isEngine, setIsEngine] = useState(false);
  const [logData, setLogData] = useState([]);
  const [logCount, setLogCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState({});
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    manager.onStateChange((state) => {
      const subscription = manager.onStateChange(async (state) => {
        console.log(state);
        const newLogData = logData;
        newLogData.push(state);
        await setLogCount(newLogData.length);
        await setLogData(newLogData);
        subscription.remove();
      }, true);
      return () => subscription.remove();
    });
  }, [manager]);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View style={{ flex: 1, padding: 10 }}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.text}>Bluetooth</Text>
          </View>
          <Button
            title={`TURN ${isEnabled ? 'ON' : 'OFF'}`}
            onPress={async () => {
              const btState = await manager.state()
              // test is bluetooth is supported
              if (btState === "Unsupported") {
                alert("Bluetooth is not supported");
                return (false);
              }
              // enable if it is not powered on
              if (btState !== "PoweredOn") {
                await manager.enable();
                setIsEnabled(true)
              } else {
                await manager.disable();
                setIsEnabled(false)
              }
              return (true);
            }}
          />
        </View>

        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.text}>Engine</Text>
          </View>
          <View>
            <Button
              title={`TURN ${isEngine ? 'ON' : 'OFF'}`}
              onPress={async () => {
                const btState = await manager.state()
                // test if bluetooth is powered on
                if (btState !== "PoweredOn") {
                  alert("Bluetooth is not powered on");
                  return (false);
                }
                // explicitly ask for user's permission
                const permission = await requestPermission();
                if (permission) {
                  // handle turn on turn off engine
                }
                return (true);
              }}
            />
          </View>
        </View>

        <View style={{ flex: 2, paddingHorizontal: 10, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Scanned Devices ({deviceCount})</Text>
          <ScrollView style={{ paddingVertical: 10, marginBottom: 10 }}>
            {
              Object.values(scannedDevices) && Object.values(scannedDevices).map((item) => {
                return (
                  <View key={item.id} style={{ backgroundColor: '#D8FFD4', height: 50, marginBottom: 10, borderRadius: 5, justifyContent: 'center', paddingLeft: 20 }}>
                    <Text>Tên thiết bị: {`${item.name}`}</Text>
                    <Text>ID thiết bị: {`(${item.id})`}</Text>
                  </View>)
              })
            }
          </ScrollView>

          <Button
            title="Scan Devices"
            onPress={async () => {
              const btState = await manager.state()
              // test if bluetooth is powered on
              if (btState !== "PoweredOn") {
                alert("Bluetooth is not powered on");
                return (false);
              }
              // explicitly ask for user's permission
              const permission = await requestPermission();
              if (permission) {
                console.log(permission);
                manager.startDeviceScan(null, null, async (error, device) => {
                  // error handling
                  if (error) {
                    console.log(error);
                    return
                  }
                  // found a bluetooth device
                  if (device) {
                    console.log({ device });
                    const newScannedDevices = scannedDevices;
                    newScannedDevices[device.id] = device;
                    await setDeviceCount(Object.keys(newScannedDevices).length);
                    await setScannedDevices(scannedDevices);
                  }
                });
              }
              return (true);
            }}
          />
        </View>

        <View style={[styles.rowWrapper]}>
          <Text style={[styles.text, { paddingLeft: 30 }]}>Soil moisture</Text>
          <Text style={[styles.text, { paddingRight: 30 }]}>80</Text>
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
              value={25}
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
              value={25}
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
      marginBottom: 10,
    },

    wrapper: {
      width: 144,
      height: 60,
      backgroundColor: 'rgba(132, 183, 143, 0.2)',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },

    secondWrapper: {
      height: 75,
      backgroundColor: 'rgba(132, 183, 143, 0.2)',
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 10,
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