import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../styles/globalStyles";
import { getCinemaDetails } from "../api/googlePlacesApi";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

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
    <ScrollView style={styles.container} bounces={false}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, `${colors.primary}80`]}
        style={styles.header}
      >
        <Text style={styles.title}>{cinema.name}</Text>
        {(cinema.rating || details?.rating) && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>
              {cinema.rating || details?.rating}
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>
              <Text style={styles.infoText}>
                {details?.formatted_address || cinema.vicinity}
              </Text>
            </View>

            {details?.formatted_phone_number && (
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="call" size={20} color={colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  {details.formatted_phone_number}
                </Text>
              </View>
            )}

            {(cinema.opening_hours || details?.opening_hours) && (
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                </View>
                <View style={styles.statusContainer}>
                  <Text style={styles.infoText}>
                    {(cinema.opening_hours || details?.opening_hours).open_now
                      ? "Open Now"
                      : "Closed"}
                  </Text>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: (
                          cinema.opening_hours || details?.opening_hours
                        ).open_now
                          ? "#4CAF50"
                          : "#FF5252",
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
            <Ionicons name="navigate" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Get Directions</Text>
          </TouchableOpacity>

          {details?.website && (
            <TouchableOpacity
              style={[styles.directionsButton, styles.websiteButton]}
              onPress={() => Linking.openURL(details.website)}
            >
              <Ionicons name="globe" size={20} color={colors.white} />
              <Text style={styles.buttonText}>Visit Website</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xl * 2,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentContainer: {
    marginTop: -20,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: spacing.sm,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    padding: spacing.xs,
    borderRadius: 20,
  },
  rating: {
    marginLeft: spacing.xs,
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
  },
  infoSection: {
    padding: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  websiteButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
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
});
