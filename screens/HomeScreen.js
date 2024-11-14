import React, { useState, useCallback } from 'react';
import { View, TextInput, Dimensions, StyleSheet, Keyboard } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { colors, spacing } from '../styles/globalStyles';
import { searchMoviesAndTVShows } from '../api/tmdbApi';
import Movies from '../components/Movies';
import TVShows from '../components/TVShows';
import SearchResults from '../components/SearchResults';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash/debounce';

const SEARCH_DELAY = 500; // 500ms delay

export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ movies: [], tvShows: [] });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'movies', title: 'Movies' },
    { key: 'tvshows', title: 'TV Shows' },
  ]);

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

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    performSearch(text);
  };

  const handleMoviePress = (movie) => {
    Keyboard.dismiss();
    setIsSearchFocused(false);
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  const handleTVShowPress = (show) => {
    Keyboard.dismiss();
    setIsSearchFocused(false);
    navigation.navigate('TVShowDetail', { showId: show.id });
  };

  const renderScene = SceneMap({
    movies: Movies,
    tvshows: TVShows,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={{ backgroundColor: colors.background }}
      labelStyle={{ color: colors.text }}
      activeColor={colors.primary}
      inactiveColor={colors.textSecondary}
    />
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
          initialLayout={{ width: Dimensions.get('window').width }}
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
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    fontSize: 16,
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  tabView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  searchResults: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
