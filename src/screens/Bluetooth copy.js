
import React, { useState, useEffect } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, Switch, Text, View, FlatList, Button, PermissionsAndroid } from "react-native";

export const manager = new BleManager();


function Bluetooth(props) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [btStatus, setBluetoothStatus] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [devices, setDevices] = useState([]);
  const [unpairedDevices, setUnpairedDevices] = useState([]);
  const [connected, setConnected] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const btManager = BluetoothSerial;

  const getStatusFromDevice = async () => {
    const status = await btManager.isEnabled();
    setBluetoothStatus(status);
  };

  useEffect(() => {
    getStatusFromDevice();
    btManager.on("bluetoothEnabled", () => {
      setBluetoothStatus(true);
    });
    btManager.on("bluetoothDisabled", () => {
      setBluetoothStatus(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.text}>Bluetooth</Text>
        </View>
        <View>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled} />
        </View>

      </View>
    </View >
  )
}

export default Bluetooth;

const styles = StyleSheet.create(
  {
    container: {
      width: '100%',
      height: '100%',
      paddingHorizontal: 30,
      paddingTop: 40,
      backgroundColor: '#D8FFD4',
      justifyContent: 'flex-start',
    },

    headerContainer: {
      width: '100%',
      height: 80,
      flexDirection: 'row',
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(132, 183, 143, 0.2)',
      borderRadius: 20,
      marginBottom: 50,
    },

    rowWrapper: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 40,
    },

    wrapper: {
      width: 144,
      height: 70,
      backgroundColor: '#62CB79',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },

    secondWrapper: {
      height: 75,
      backgroundColor: '#62CB79',
      borderRadius: 20,
      alignItems: 'center',
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