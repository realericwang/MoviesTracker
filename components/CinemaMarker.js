import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/globalStyles";

export default function CinemaMarker({ cinema, onPress }) {
  useEffect(() => {
    console.log("Rendering marker for:", cinema.name, {
      lat: cinema.geometry.location.lat,
      lng: cinema.geometry.location.lng,
    });
  }, []);

  return (
    <Marker
      coordinate={{
        latitude: cinema.geometry.location.lat,
        longitude: cinema.geometry.location.lng,
      }}
      onPress={() => onPress(cinema)}
      pinColor={colors.primary}
      title={cinema.name}
    >
      <Ionicons
        name="film-outline"
        size={24}
        color={colors.primary}
        style={styles.icon}
      />
    </Marker>
  );
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: "white",
    padding: 4,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
