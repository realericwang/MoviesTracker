import { useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Text } from "react-native";
import { fetchUserBookmarks } from "../firebase/firestoreHelper";
import CountryCoordinates from "./common/CountryCoordinates";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Animated } from "react-native";
const Map = ({ navigation }) => {
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [countryMovieCounts, setCountryMovieCounts] = useState({});
  const [moviesByCountry, setMoviesByCountry] = useState({});
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Add marker animation
  const markerScale = new Animated.Value(1);

  useFocusEffect(
    useCallback(() => {
      const loadBookmarkedMovies = async () => {
        try {
          const movies = await fetchUserBookmarks();
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
          const movieCountsByCountry = Object.keys(groupedMovies).reduce(
            (counts, country) => {
              counts[country] = groupedMovies[country].length;
              return counts;
            },
            {}
          );

          setCountryMovieCounts(movieCountsByCountry);
        } catch (error) {
          console.error("Error fetching bookmarked movies:", error);
        }
      };

      loadBookmarkedMovies();
    }, [])
  );

  const handleMarkerPress = (country) => {
    setSelectedMarker(country);
    // Add click animation
    Animated.sequence([
      Animated.timing(markerScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(markerScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const movies = moviesByCountry[country];
    if (movies && movies.length > 0) {
      // If multiple movies, show modal or navigate to a list screen
      navigation.navigate("CountryMovies", {
        country,
        movies: movies,
        countryColor: CountryCoordinates[country]?.color,
      });
    }
  };

  return (
    <MapView
      mapType="satellite"
      style={styles.map}
      initialRegion={{
        latitude: 20,
        longitude: 0,
        latitudeDelta: 100,
        longitudeDelta: 100,
      }}
      minZoomLevel={2}
      maxZoomLevel={7}
      rotateEnabled={false}
    >
      {Object.entries(moviesByCountry).map(([country, movies]) => {
        const coordinates = CountryCoordinates[country];
        const movieCount = movies.length;
        const firstMovie = movies[0];
        const isSelected = selectedMarker === country;

        return (
          <Marker
            key={country}
            coordinate={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }}
            onPress={() => handleMarkerPress(country)}
          >
            <Animated.View
              style={[
                styles.markerContainer,
                {
                  transform: [{ scale: isSelected ? markerScale : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.countryLabel,
                  {
                    backgroundColor:
                      CountryCoordinates[country]?.color || "#000",
                  },
                  isSelected && styles.selectedLabel,
                ]}
              >
                <Text style={styles.countryText}>{country}</Text>
                {movieCount > 1 && (
                  <Text style={styles.countText}>{` (${movieCount})`}</Text>
                )}
              </View>
            </Animated.View>
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
    alignItems: "center",
    justifyContent: "center",
  },
  countryLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedLabel: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  countryText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  countText: {
    color: "white",
    fontSize: 12,
  },
});
