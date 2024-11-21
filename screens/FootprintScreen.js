import {View, Text, StyleSheet} from "react-native";
import {useState} from "react";
import Map from "../components/Map";
import {useNavigation} from "@react-navigation/native";
/**
 * FootprintScreen Component
 *
 * This component serves as a placeholder or informational screen within the app.
 * It currently displays a simple message indicating the "Footprint Screen".
 * Future enhancements can include user-specific footprint data or related functionalities.
 *
 * @component
 * @returns {React.Element} The rendered FootprintScreen component.
 */
export default function FootprintScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text>Footprint Screen</Text>
            <Map navigation={navigation}/>
        </View>
    );
}
/**
 * Styles for the FootprintScreen component.
 * Defines the layout, alignment, and text styling.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
