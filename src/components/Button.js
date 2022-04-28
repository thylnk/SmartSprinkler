import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Button = (props) => {
	return (
		<TouchableOpacity>
			<View style={[props.style, styles.btnWrapper]}>
				<Text style={styles.text}>{props.text}</Text>
			</View>
		</TouchableOpacity>
	)
};

export default Button

const styles = StyleSheet.create(
	{
		btnWrapper: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: 60,
			height: 60,
			borderRadius: 20,
			marginRight: 10,
		},
		text: {
			fontFamily: 'Lato_700Bold',
			fontSize: 20,
			textShadowColor: "rgba(0, 0, 0, 0.25)",
			textShadowOffset: { width: 2, height: 2 },
			textShadowRadius: 10,
			color: '#ffffff',
		}
	}
)