import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  fetchPopularMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
} from "../api/tmdbApi";
import BannerRotator from "./BannerRotator";
import MovieCategory from "./MovieCategory";
import MovieCard from "./MovieCard";
import { useNavigation } from "@react-navigation/native";
/**
 * Movies component to display a list of movies categorized by popularity, upcoming releases, and top-rated movies.
 *
 * This component fetches data for popular, upcoming, and top-rated movies from the TMDB API using `Promise.all` for concurrent requests.  It uses a `BannerRotator` component to display a rotating banner of popular movies, and `MovieCategory` components to organize the lists. Each movie is displayed as a `MovieCard`, allowing navigation to the detail screen on press.
 *
 * @param {object} navigation - React Navigation's navigation object. Used to navigate to the movie detail screen.
 * @returns {JSX.Element} The Movies component.
 */
export default function Movies() {
  const navigation = useNavigation();
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
    navigation.navigate("MovieDetail", { movieId: movie.id });
  };

  return (
    <ScrollView style={styles.container}>
      <BannerRotator movies={popularMovies} />

      <MovieCategory title="Popular Movies">
        {popularMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPress={() => handleMoviePress(movie)}
          />
        ))}
      </MovieCategory>

      <MovieCategory title="Coming Soon">
        {upcomingMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPress={() => handleMoviePress(movie)}
          />
        ))}
      </MovieCategory>

      <MovieCategory title="Top Rated">
        {topRatedMovies.map((movie) => (
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
