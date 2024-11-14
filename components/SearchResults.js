import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors, spacing } from "../styles/globalStyles";
import { getImageUrl } from "../api/tmdbApi";

export default function SearchResults({
  movies,
  tvShows,
  onMoviePress,
  onTVShowPress,
}) {
  const renderItem = ({ item, type }) => {
    const title = type === "movie" ? item.title : item.name;
    const year = new Date(
      type === "movie" ? item.release_date : item.first_air_date
    ).getFullYear();
    const onPress = type === "movie" ? onMoviePress : onTVShowPress;

    return (
      <TouchableOpacity style={styles.resultItem} onPress={() => onPress(item)}>
        {item.poster_path ? (
          <Image
            source={{ uri: getImageUrl(item.poster_path) }}
            style={styles.poster}
          />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.posterPlaceholderText}>{title.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.year}>{year || "N/A"}</Text>
          <View style={styles.typeContainer}>
            <Text style={styles.type}>
              {type === "movie" ? "Movie" : "TV Show"}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {item.vote_average.toFixed(1)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const combinedResults = [
    ...movies.map((movie) => ({ ...movie, type: "movie" })),
    ...tvShows.map((show) => ({ ...show, type: "tv" })),
  ].sort((a, b) => b.popularity - a.popularity);

  return (
    <FlatList
      data={combinedResults}
      renderItem={({ item }) => renderItem({ item, type: item.type })}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  resultItem: {
    flexDirection: "row",
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  poster: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  itemInfo: {
    marginLeft: spacing.sm,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  typeContainer: {
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  posterPlaceholder: {
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  posterPlaceholderText: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
});
