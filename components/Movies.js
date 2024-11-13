import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { fetchPopularMovies, fetchUpcomingMovies, fetchTopRatedMovies } from '../api/tmdbApi';
import BannerRotator from './BannerRotator';
import MovieCategory from './MovieCategory';
import MovieCard from './MovieCard';

export default function Movies() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      const [popular, upcoming, topRated] = await Promise.all([
        fetchPopularMovies(),
        fetchUpcomingMovies(),
        fetchTopRatedMovies(),
      ]);
      setPopularMovies(popular);
      setUpcomingMovies(upcoming);
      setTopRatedMovies(topRated);
    };
    loadMovies();
  }, []);

  const handleMoviePress = (movie) => {
    // TODO: Navigate to movie detail screen
    console.log('Movie pressed:', movie.title);
  };

  return (
    <ScrollView style={styles.container}>
      <BannerRotator movies={popularMovies} />
      
      <MovieCategory title="Popular Movies">
        {popularMovies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPress={() => handleMoviePress(movie)}
          />
        ))}
      </MovieCategory>

      <MovieCategory title="Coming Soon">
        {upcomingMovies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPress={() => handleMoviePress(movie)}
          />
        ))}
      </MovieCategory>

      <MovieCategory title="Top Rated">
        {topRatedMovies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPress={() => handleMoviePress(movie)}
          />
        ))}
      </MovieCategory>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
