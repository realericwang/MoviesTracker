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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [sortBy, setSortBy] = useState('timestamp');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
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

  useEffect(() => {
    const filtered = bookmarkedMovies.filter((movie) =>
      movie.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort the filtered movies
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'year') {
        const yearA = new Date(a.releaseDate).getFullYear();
        const yearB = new Date(b.releaseDate).getFullYear();
        return yearB - yearA; // Sort by year descending
      } else {
        // Sort by timestamp descending (most recently added first)
        return b.timestamp - a.timestamp;
      }
    });

    setFilteredMovies(sorted);
  }, [searchQuery, bookmarkedMovies, sortBy]);

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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.dropdownButton, isDropdownVisible && styles.dropdownButtonActive]}
            onPress={() => setIsDropdownVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              Sort by: {sortBy === 'timestamp' ? 'Date Added' : 'Release Year'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </TouchableOpacity>

          <Modal
            visible={isDropdownVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsDropdownVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setIsDropdownVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        sortBy === 'timestamp' && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        setSortBy('timestamp');
                        setIsDropdownVisible(false);
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        <Ionicons 
                          name="time-outline" 
                          size={20} 
                          color={sortBy === 'timestamp' ? colors.primary : colors.text} 
                        />
                        <Text style={[
                          styles.dropdownItemText,
                          sortBy === 'timestamp' && styles.dropdownItemTextSelected
                        ]}>
                          Date Added
                        </Text>
                      </View>
                      {sortBy === 'timestamp' && (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        sortBy === 'year' && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        setSortBy('year');
                        setIsDropdownVisible(false);
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        <Ionicons 
                          name="calendar-outline" 
                          size={20} 
                          color={sortBy === 'year' ? colors.primary : colors.text} 
                        />
                        <Text style={[
                          styles.dropdownItemText,
                          sortBy === 'year' && styles.dropdownItemTextSelected
                        ]}>
                          Release Year
                        </Text>
                      </View>
                      {sortBy === 'year' && (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </View>
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
  searchContainer: {
    padding: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  sortContainer: {
    marginTop: spacing.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    shadowColor: '#000',
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
  dropdownButtonText: {
    color: colors.text,
    fontSize: 14,
    marginRight: spacing.xs,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 150,
    paddingHorizontal: spacing.lg,
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}40`,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
});
