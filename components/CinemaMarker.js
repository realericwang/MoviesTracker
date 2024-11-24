import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/globalStyles";

export default function CinemaMarker({ cinema, onPress }) {
  return (
    <Marker
      coordinate={{
        latitude: cinema.geometry.location.lat,
        longitude: cinema.geometry.location.lng,
      }}
      onPress={() => onPress(cinema)}
    >
      <View style={styles.markerContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="film-outline" size={20} color="white" />
        </View>
        <View style={styles.label}>
          <Text style={styles.text} numberOfLines={1}>
            {cinema.name}
          </Text>
          {cinema.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{cinema.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    width: 150,
  },
  iconContainer: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  label: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  ratingText: {
    color: colors.text,
    fontSize: 12,
    marginLeft: 2,
  },
});
