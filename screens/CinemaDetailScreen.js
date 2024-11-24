import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../styles/globalStyles";
import { getCinemaDetails } from "../api/googlePlacesApi";

export default function CinemaDetailScreen({ route }) {
  const { cinema } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      const cinemaDetails = await getCinemaDetails(cinema.place_id);
      setDetails(cinemaDetails);
      setLoading(false);
    };
    loadDetails();
  }, [cinema.place_id]);

  const openMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${cinema.geometry.location.lat},${cinema.geometry.location.lng}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cinema.name}</Text>
        {(cinema.rating || details?.rating) && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>
              {cinema.rating || details?.rating}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            {details?.formatted_address || cinema.vicinity}
          </Text>
        </View>

        {details?.formatted_phone_number && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              {details.formatted_phone_number}
            </Text>
          </View>
        )}

        {(cinema.opening_hours || details?.opening_hours) && (
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              {(cinema.opening_hours || details?.opening_hours).open_now
                ? "Open Now"
                : "Closed"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
        <Ionicons name="navigate" size={20} color={colors.white} />
        <Text style={styles.directionsText}>Get Directions</Text>
      </TouchableOpacity>

      {details?.website && (
        <TouchableOpacity
          style={[styles.directionsButton, styles.websiteButton]}
          onPress={() => Linking.openURL(details.website)}
        >
          <Ionicons name="globe" size={20} color={colors.white} />
          <Text style={styles.directionsText}>Visit Website</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: spacing.xs,
    fontSize: 16,
    color: colors.text,
  },
  infoSection: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  infoText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
  },
  directionsText: {
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  websiteButton: {
    backgroundColor: colors.secondary,
    marginTop: 0,
  },
});
