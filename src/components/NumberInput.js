import { AntDesign } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from "react-native";

const NumberInput = () => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="360"
        keyboardType="numeric"
      />
      <View style={{ width: 40, display: "flex", alignItems: "center" }}>
        <AntDesign name="plus" size={20} color="black" />

        <AntDesign name="minus" size={20} color="black" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    padding: 18,
    width: 70,
    fontFamily: 'Lato_700Bold',
    fontSize: 20,
    color: "#ffffff",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    width: 130,
    height: 60,
    justifyContent: "space-evenly",
    alignItems: 'center',
    backgroundColor: '#62CB79',
    borderRadius: 20,
  }
})

export default NumberInput