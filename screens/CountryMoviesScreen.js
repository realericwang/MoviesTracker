import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import MovieCard from '../components/MovieCard';
import { colors, spacing } from '../styles/globalStyles';

export default function CountryMoviesScreen({ route, navigation }) {
  const { country, movies, countryColor } = route.params;

  // Transform bookmarked movie data to match TMDB format
  const transformedMovies = movies.map(movie => ({
    id: movie.movieId,
    title: movie.movieTitle,
    poster_path: movie.posterPath,
    vote_average: movie.rating || 0, // Add a default rating if none exists
    release_date: movie.releaseDate
  }));

  const handleMoviePress = (movie) => {
    navigation.navigate("MovieDetail", { movieId: movie.id });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transformedMovies}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={() => handleMoviePress(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
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
    padding: spacing.md,
  }
});
