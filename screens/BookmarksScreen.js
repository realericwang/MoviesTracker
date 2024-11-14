import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebaseSetup";
import { getDocsByQueries } from "../firebase/firestoreHelper";
import { getImageUrl } from "../api/tmdbApi";
import { colors, spacing } from "../styles/globalStyles";
import { where } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function BookmarksScreen() {
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const user = auth.currentUser;

  const fetchBookmarkedMovies = async () => {
    if (!user) {
      setBookmarkedMovies([]);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const bookmarksData = await getDocsByQueries("bookmarks", [
        where("userId", "==", user.uid),
      ]);
      setBookmarkedMovies(bookmarksData);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setError("Failed to load bookmarks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookmarkedMovies();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    return navigation.addListener("focus", () => {
      fetchBookmarkedMovies();
    });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.movieItem}
        onPress={() =>
          navigation.navigate("MovieDetail", { movieId: item.movieId })
        }
        accessible={true}
        accessibilityLabel={`Movie ${item.movieTitle}`}
        accessibilityHint="Double tap to view movie details"
      >
        <Image
          source={{ uri: getImageUrl(item.posterPath) }}
          style={styles.poster}
          accessible={true}
          accessibilityLabel={`${item.movieTitle} poster`}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.movieTitle}
          </Text>
          <View style={styles.metadataContainer}>
            {item.director && (
              <Text style={styles.directorText} numberOfLines={1}>
                Dir: {item.director}
              </Text>
            )}
            {item.releaseDate && (
              <Text style={styles.yearText}>
                {new Date(item.releaseDate).getFullYear()}
              </Text>
            )}
          </View>
          {item.genres && (
            <Text style={styles.genreText} numberOfLines={1}>
              {item.genres}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    []
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchBookmarkedMovies}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="bookmark-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyStateTitle}>Sign in to view bookmarks</Text>
        <Text style={styles.emptyStateText}>
          Keep track of movies you want to watch later
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate("Auth")}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (bookmarkedMovies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="bookmark-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyStateTitle}>No bookmarks yet</Text>
        <Text style={styles.emptyStateText}>
          Start adding movies to your bookmarks
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarkedMovies}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  movieItem: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${colors.border}80`,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  movieInfo: {
    flex: 1,
    justifyContent: "center",
    height: 90,
    paddingVertical: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  signInButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  directorText: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
    marginRight: spacing.sm,
  },
  yearText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: 13,
    opacity: 0.8,
  },
});
