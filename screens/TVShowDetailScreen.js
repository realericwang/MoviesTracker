import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../styles/globalStyles";
import { fetchTVShowDetails, getImageUrl } from "../api/tmdbApi";
/**
 * TVShowDetailScreen component to display details of a TV show.
 *
 * This component fetches and displays detailed information about a specific TV show,
 * including its title, overview, cast, seasons, and ratings.  It handles loading and error states.
 * Uses TMDB API to fetch TV show details and image URLs.
 *
 * @param {object} route - React Navigation's route prop.
 * @param {number} route.params.showId - The ID of the TV show to display.
 * @returns {JSX.Element} The TVShowDetailScreen component.
 */
export default function TVShowDetailScreen({ route }) {
  const { showId } = route.params;
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShowDetails = async () => {
      try {
        const details = await fetchTVShowDetails(showId);
        setShow(details);
      } catch (error) {
        console.error("Error loading TV show details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadShowDetails();
  }, [showId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load TV show details</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: getImageUrl(show.backdrop_path) }}
        style={styles.backdrop}
      />

      <View style={styles.details}>
        <Text style={styles.title}>{show.name}</Text>

        <View style={styles.metadata}>
          <Text style={styles.year}>
            {new Date(show.first_air_date).getFullYear()}
          </Text>
          <Text style={styles.episodes}>
            {show.number_of_seasons} Season
            {show.number_of_seasons !== 1 ? "s" : ""}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {show.vote_average.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.genres}>
          {show.genres.map((genre) => (
            <View key={genre.id} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>{show.overview}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {show.credits?.cast?.slice(0, 10).map((actor) => (
              <View key={actor.id} style={styles.castMember}>
                <Image
                  source={{ uri: getImageUrl(actor.profile_path) }}
                  style={styles.castImage}
                />
                <Text style={styles.castName} numberOfLines={2}>
                  {actor.name}
                </Text>
                <Text style={styles.characterName} numberOfLines={1}>
                  {actor.character}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Season</Text>
          {show.seasons?.length > 0 && (
            <View style={styles.seasonInfo}>
              <Text style={styles.seasonTitle}>
                {show.seasons[show.seasons.length - 1].name}
              </Text>
              <Text style={styles.episodeCount}>
                {show.seasons[show.seasons.length - 1].episode_count} Episodes
              </Text>
              {show.seasons[show.seasons.length - 1].air_date && (
                <Text style={styles.airDate}>
                  Aired:{" "}
                  {new Date(
                    show.seasons[show.seasons.length - 1].air_date
                  ).toLocaleDateString()}
                </Text>
              )}
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  backdrop: {
    width: "100%",
    height: 250,
    backgroundColor: colors.border,
  },
  details: {
    padding: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  year: {
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  episodes: {
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  genreTag: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  genreText: {
    color: colors.primary,
    fontSize: 12,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  overviewText: {
    color: colors.text,
    lineHeight: 20,
  },
  castMember: {
    width: 100,
    marginRight: spacing.sm,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  castName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text,
    marginTop: spacing.xs,
  },
  characterName: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  seasonInfo: {
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: 8,
  },
  seasonTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  episodeCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  airDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
