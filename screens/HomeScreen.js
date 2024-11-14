import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  Dimensions,
  StyleSheet,
  Keyboard,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { colors, spacing } from "../styles/globalStyles";
import { searchMoviesAndTVShows } from "../api/tmdbApi";
import Movies from "../components/Movies";
import TVShows from "../components/TVShows";
import SearchResults from "../components/SearchResults";
import { useNavigation } from "@react-navigation/native";
import debounce from "lodash/debounce";

const SEARCH_DELAY = 500; // 500ms delay
/**
 * HomeScreen component for searching movies and TV shows.
 *
 * This component displays a search bar at the top, allowing users to search for movies and TV shows.
 * Based on the search query, it shows either search results or a tab view for browsing movies and TV shows.
 * Uses `react-native-tab-view` for tabbed navigation between Movies and TV Shows sections.
 * Implements debouncing to avoid excessive API calls during typing.
 *
 * @returns {JSX.Element} The HomeScreen component.
 */
export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    movies: [],
    tvShows: [],
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [index, setIndex] = useState(0);
  const routes = [
    { key: "movies", title: "Movies" },
    { key: "tvshows", title: "TV Shows" },
  ];

  const performSearch = useCallback(
    debounce(async (query) => {
      if (query.length >= 2) {
        const results = await searchMoviesAndTVShows(query);
        setSearchResults(results);
      } else {
        setSearchResults({ movies: [], tvShows: [] });
      }
    }, SEARCH_DELAY),
    []
  );

  const handleSearchChange = useCallback(
    (text) => {
      setSearchQuery(text);
      performSearch(text);
    },
    [performSearch]
  );

  const handleMoviePress = useCallback(
    (movie) => {
      Keyboard.dismiss();
      setIsSearchFocused(false);
      navigation.navigate("MovieDetail", { movieId: movie.id });
    },
    [navigation]
  );

  const handleTVShowPress = useCallback(
    (show) => {
      Keyboard.dismiss();
      setIsSearchFocused(false);
      navigation.navigate("TVShowDetail", { showId: show.id });
    },
    [navigation]
  );

  const renderScene = useMemo(
    () =>
      SceneMap({
        movies: Movies,
        tvshows: TVShows,
      }),
    []
  );

  const renderTabBar = useCallback(
    (props) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: colors.primary }}
        style={{ backgroundColor: colors.background }}
        labelStyle={{ color: colors.text }}
        activeColor={colors.primary}
        inactiveColor={colors.textSecondary}
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies or TV shows..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
        />
      </View>

      {isSearchFocused && searchQuery.length >= 2 ? (
        <View style={styles.searchResults}>
          <SearchResults
            movies={searchResults.movies}
            tvShows={searchResults.tvShows}
            onMoviePress={handleMoviePress}
            onTVShowPress={handleTVShowPress}
          />
        </View>
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get("window").width }}
          renderTabBar={renderTabBar}
          style={styles.tabView}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  searchContainer: {
    padding: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 25,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    fontSize: 16,
    color: colors.text,
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.5,
    elevation: 4,
  },
  tabView: {
    flex: 1,
    marginTop: spacing.xs,
  },
  tabContent: {
    flex: 1,
  },
  searchResults: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
});
