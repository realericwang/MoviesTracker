import React from "react";
import { View, StyleSheet } from "react-native";
import Map from "../components/Map";

export default function FootprintScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Map navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
