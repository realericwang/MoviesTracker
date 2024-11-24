import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebaseSetup";
import {
  fetchBookmarkedMovies,
  getDocsByQueries,
} from "../firebase/firestoreHelper";
import { where } from "firebase/firestore";
import { getImageUrl } from "../api/tmdbApi";
import { colors, spacing } from "../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";

/**
 * BookmarksScreen Component
 *
 * This component displays a list of bookmarked movies for the authenticated user.
 * It allows users to search and sort their bookmarks, refresh the list, and navigate
 * to detailed movie information. If the user is not authenticated, it prompts them to sign in.
 *
 * @component
 * @returns {React.Element} The rendered component.
 */
export default function BookmarksScreen() {
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [bookmarkedTVShows, setBookmarkedTVShows] = useState([]);
  const [combinedBookmarks, setCombinedBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [sortBy, setSortBy] = useState("timestamp");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigation = useNavigation();
  const [user, setUser] = useState(auth.currentUser);

  /**
   * Fetches bookmarked movies from Firestore based on the authenticated user.
   * Sets the `bookmarkedMovies` state with the fetched data.
   */
  const loadBookmarkedMovies = async () => {
    if (!user) {
      setBookmarkedMovies([]);
      setBookmarkedTVShows([]);
      setCombinedBookmarks([]);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const [moviesData, tvShowsData] = await Promise.all([
        fetchBookmarkedMovies(user),
        getDocsByQueries("tvshowbookmarks", [where("userId", "==", user.uid)]),
      ]);

      setBookmarkedMovies(moviesData);
      setBookmarkedTVShows(tvShowsData);

      // Combine and sort both types of bookmarks
      const combined = [
        ...moviesData.map((movie) => ({
          ...movie,
          type: "movie",
          title: movie.movieTitle,
          date: movie.releaseDate,
        })),
        ...tvShowsData.map((show) => ({
          ...show,
          type: "tvshow",
          title: show.showTitle,
          date: show.firstAirDate,
        })),
      ];

      setCombinedBookmarks(combined);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookmarkedMovies();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    return navigation.addListener("focus", () => {
      loadBookmarkedMovies();
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      loadBookmarkedMovies();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = combinedBookmarks.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort the filtered items
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "year") {
        const yearA = new Date(a.date).getFullYear();
        const yearB = new Date(b.date).getFullYear();
        return yearB - yearA; // Sort by year descending
      } else {
        // Sort by timestamp descending (most recently added first)
        return b.timestamp - a.timestamp;
      }
    });

    setFilteredMovies(sorted);
  }, [searchQuery, combinedBookmarks, sortBy]);

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.movieItem}
        onPress={() =>
          navigation.navigate(
            item.type === "movie" ? "MovieDetail" : "TVShowDetail",
            item.type === "movie"
              ? { movieId: item.movieId }
              : { showId: item.showId }
          )
        }
        accessible={true}
        accessibilityLabel={`${item.type === "movie" ? "Movie" : "TV Show"} ${
          item.title
        }`}
        accessibilityHint="Double tap to view details"
      >
        <Image
          source={{ uri: getImageUrl(item.posterPath) }}
          style={styles.poster}
          accessible={true}
          accessibilityLabel={`${item.title} poster`}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metadataContainer}>
            {item.director && (
              <Text style={styles.directorText} numberOfLines={1}>
                {item.type === "movie" ? "Dir: " : "Created by: "}
                {item.type === "movie" ? item.director : item.creator}
              </Text>
            )}
            {item.date && (
              <Text style={styles.yearText}>
                {new Date(item.date).getFullYear()}
              </Text>
            )}
          </View>
          <View style={styles.typeAndRating}>
            <View style={styles.typeTag}>
              <Text style={styles.typeText}>
                {item.type === "movie" ? "Movie" : "TV Show"}
              </Text>
            </View>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={styles.ratingText}>
                {item.voteAverage ? item.voteAverage.toFixed(1) : "N/A"}
              </Text>
            </View>
          </View>
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
          onPress={loadBookmarkedMovies}
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

  if (combinedBookmarks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="bookmark-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyStateTitle}>No bookmarks yet</Text>
        <Text style={styles.emptyStateText}>
          Start adding movies and TV shows to your bookmarks
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            isDropdownVisible && styles.dropdownButtonActive,
          ]}
          onPress={() => setIsDropdownVisible(true)}
        >
          <Ionicons
            name="funnel-outline"
            size={18}
            color={sortBy === "year" ? colors.primary : colors.text}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[styles.dropdownMenu, { right: spacing.md, top: 100 }]}
              >
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    sortBy === "timestamp" && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSortBy("timestamp");
                    setIsDropdownVisible(false);
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={
                        sortBy === "timestamp" ? colors.primary : colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.dropdownItemText,
                        sortBy === "timestamp" &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      Date Added
                    </Text>
                  </View>
                  {sortBy === "timestamp" && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    sortBy === "year" && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSortBy("year");
                    setIsDropdownVisible(false);
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={sortBy === "year" ? colors.primary : colors.text}
                    />
                    <Text
                      style={[
                        styles.dropdownItemText,
                        sortBy === "year" && styles.dropdownItemTextSelected,
                      ]}
                    >
                      Release Year
                    </Text>
                  </View>
                  {sortBy === "year" && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  searchInput: {
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownMenu: {
    position: "absolute",
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.border}80`,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}40`,
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dropdownItemSelected: {
    backgroundColor: `${colors.primary}15`,
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  typeAndGenre: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  typeTag: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  typeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  typeAndRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
