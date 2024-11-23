import { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Text } from "react-native";
import Favicon from "../assets/favicon.png";
import { fetchPopularMovies, getImageUrl } from "../api/tmdbApi";
import { getAllDocs } from "../firebase/firestoreHelper";
import { Image as RNImage } from "react-native";
import CountryCoordinates from "./common/CountryCoordinates";

const Map = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [countryMovieCounts, setCountryMovieCounts] = useState({});
  const [moviesByCountry, setMoviesByCountry] = useState({});

  useEffect(() => {
    const loadBookmarkedMovies = async () => {
      try {
        const movies = await getAllDocs("bookmarks");
        setBookmarkedMovies(movies);

        // Group movies by country
        const groupedMovies = movies.reduce((groups, movie) => {
          const country = movie.productionCountries;
          if (country && CountryCoordinates[country]) {
            if (!groups[country]) {
              groups[country] = [];
            }
            groups[country].push(movie);
          }
          return groups;
        }, {});

        setMoviesByCountry(groupedMovies);
        
        // Count movies per country
        const movieCountsByCountry = Object.keys(groupedMovies).reduce((counts, country) => {
          counts[country] = groupedMovies[country].length;
          return counts;
        }, {});

        setCountryMovieCounts(movieCountsByCountry);
      } catch (error) {
        console.error("Error fetching bookmarked movies:", error);
      }
    };

    loadBookmarkedMovies();
  }, []);

  const handleMarkerPress = (country) => {
    const movies = moviesByCountry[country];
    if (movies && movies.length > 0) {
      // If only one movie, navigate directly to it
      if (movies.length === 1) {
        navigation.navigate("MovieDetail", { movieId: movies[0].movieId });
      } else {
        // If multiple movies, show modal or navigate to a list screen
        navigation.navigate("CountryMovies", { 
          country,
          movies: movies,
          countryColor: CountryCoordinates[country]?.color
        });
      }
    }
  };

  return (
    <MapView
      mapType="satellite"
      initialRegion={{
        latitude: 49.2827,
        longitude: -123.1207,
        latitudeDelta: 115,
        longitudeDelta: 150,
      }}
      style={styles.map}
    >
      {Object.entries(moviesByCountry).map(([country, movies]) => {
        const coordinates = CountryCoordinates[country];
        const movieCount = movies.length;
        const firstMovie = movies[0];

        return (
          <Marker
            key={country}
            coordinate={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }}
            title={`${country} (${movieCount} movies)`}
            description={movieCount > 1 ? "Tap to see all movies" : firstMovie.movieTitle}
            onPress={() => handleMarkerPress(country)}
          >
            <View style={styles.markerContainer}>
              <RNImage
                source={{ uri: getImageUrl(firstMovie.posterPath) }}
                style={styles.poster}
              />
              <View
                style={[
                  styles.countryName,
                  {
                    backgroundColor: CountryCoordinates[country]?.color || "black",
                  },
                ]}
              >
                <Text>{country}</Text>
              </View>
              {movieCount > 1 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{movieCount}</Text>
                </View>
              )}
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
};

export default Map;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    position: "relative",
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 15,
  },
  countBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "red",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "white",
    fontWeight: "bold",
  },
  countryName: {
    backgroundColor: "yellow",
    padding: 5,
    borderRadius: 5,
    position: "absolute",
    left: -15,
    top: 5,
  },
});
