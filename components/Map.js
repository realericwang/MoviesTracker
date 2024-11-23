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

  useEffect(() => {
    const loadBookmarkedMovies = async () => {
      try {
        const movies = await getAllDocs("bookmarks");
        setBookmarkedMovies(movies);

        // Count movies per country
        const movieCountsByCountry = movies.reduce((counts, movie) => {
          const country = movie.productionCountries;
          if (country && CountryCoordinates[country]) {
            // Only count if country exists in coordinates
            counts[country] = (counts[country] || 0) + 1;
          }
          return counts;
        }, {});

        setCountryMovieCounts(movieCountsByCountry);
      } catch (error) {
        console.error("Error fetching bookmarked movies:", error);
      }
    };

    loadBookmarkedMovies();
  }, []);

  const handleMarkerPress = (movie) => {
    if (movie.movieId) {
      console.log(
        "Navigating to movie:",
        movie.movieTitle,
        "with ID:",
        movie.movieId
      );
      navigation.navigate("MovieDetail", { movieId: movie.movieId });
    } else {
      console.error("MovieId is undefined for movie:", movie.movieTitle);
    }
  };

  return (
    <>
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
        {bookmarkedMovies
          .filter((movie) => {
            const country = movie.productionCountries;
            return country && CountryCoordinates[country];
          })
          .map((movie, index) => {
            const country = movie.productionCountries;
            const coordinates = CountryCoordinates[country];
            const movieCount = countryMovieCounts[country] || 0;

            return (
              <Marker
                key={`${movie.id}-${index}`}
                coordinate={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                }}
                title={movie.movieTitle}
                description={`${movie.genres} - Directed by ${movie.director}`}
                onPress={() => handleMarkerPress(movie)}
              >
                <View style={styles.markerContainer}>
                  <RNImage
                    source={{ uri: getImageUrl(movie.posterPath) }}
                    style={styles.poster}
                  />
                  <View
                    style={[
                      styles.countryName,
                      {
                        backgroundColor:
                          CountryCoordinates[country]?.color || "black",
                      },
                    ]}
                  >
                    <Text>{country}</Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{movieCount}</Text>
                  </View>
                </View>
              </Marker>
            );
          })}
      </MapView>
    </>
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
