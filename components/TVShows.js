import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  fetchPopularTVShows,
  fetchTopRatedTVShows,
  fetchOnTheAirTVShows,
} from "../api/tmdbApi";
import BannerRotator from "./BannerRotator";
import MovieCategory from "./MovieCategory";
import MovieCard from "./MovieCard";
import { useNavigation } from "@react-navigation/native";

export default function TVShows() {
  const navigation = useNavigation();
  const [popularShows, setPopularShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [onTheAirShows, setOnTheAirShows] = useState([]);

  useEffect(() => {
    const loadTVShows = async () => {
      const [popular, topRated, onTheAir] = await Promise.all([
        fetchPopularTVShows(),
        fetchTopRatedTVShows(),
        fetchOnTheAirTVShows(),
      ]);
      setPopularShows(popular);
      setTopRatedShows(topRated);
      setOnTheAirShows(onTheAir);
    };
    loadTVShows();
  }, []);

  const handleShowPress = (show) => {
    navigation.navigate("TVShowDetail", { showId: show.id });
  };

  return (
    <ScrollView style={styles.container}>
      <BannerRotator movies={popularShows} />

      <MovieCategory title="Popular TV Shows">
        {popularShows.map((show) => (
          <MovieCard
            key={show.id}
            movie={show}
            onPress={() => handleShowPress(show)}
          />
        ))}
      </MovieCategory>

      <MovieCategory title="On The Air">
        {onTheAirShows.map((show) => (
          <MovieCard
            key={show.id}
            movie={show}
            onPress={() => handleShowPress(show)}
          />
        ))}
      </MovieCategory>

      <MovieCategory title="Top Rated">
        {topRatedShows.map((show) => (
          <MovieCard
            key={show.id}
            movie={show}
            onPress={() => handleShowPress(show)}
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
