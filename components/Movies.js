import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { fetchPopularMovies } from '../api/tmdbApi';
import BannerRotator from './BannerRotator';

export default function Movies() {
  const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      const movies = await fetchPopularMovies();
      setPopularMovies(movies);
    };
    loadMovies();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <BannerRotator movies={popularMovies} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
