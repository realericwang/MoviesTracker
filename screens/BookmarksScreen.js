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
        <Text style={styles.title}>{item.movieTitle}</Text>
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
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  movieItem: {
    flexDirection: "row",
    marginBottom: spacing.md,
    alignItems: "center",
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    flexShrink: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
  },
  retryText: {
    color: colors.background,
    fontSize: 16,
  },
  emptyStateTitle: {
    color: colors.textSecondary,
    fontSize: 24,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
  },
  signInButtonText: {
    color: colors.background,
    fontSize: 16,
  },
});
