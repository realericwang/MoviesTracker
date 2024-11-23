import {useEffect, useState} from "react";
import MapView, {Callout, Marker} from "react-native-maps";
import {StyleSheet, View, Text, ImageBackground} from "react-native";
import Favicon from "../assets/favicon.png";
import {fetchPopularMovies, getImageUrl} from "../api/tmdbApi";
import {getAllDocs} from "../firebase/firestoreHelper";
import {Image as RNImage} from "react-native";
import CountryCoordinates from "./common/CountryCoordinates";
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';

const Map = ({navigation}) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
    const [countryMovieCounts, setCountryMovieCounts] = useState({});
    const [moviesByCountry, setMoviesByCountry] = useState({});
    const [refresh, setRefresh] = useState(0);

    useFocusEffect(
        useCallback(() => {
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
        }, [])
    );

    const handleMarkerPress = (country) => {
        const movies = moviesByCountry[country];
        if (movies && movies.length > 0) {
            // If only one movie, navigate directly to it
            if (movies.length === 1) {
                navigation.navigate("MovieDetail", {movieId: movies[0].movieId});
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
            // initialRegion={{
            //   latitude: 49.2827,
            //   longitude: -123.1207,
            //   latitudeDelta: 115,
            //   longitudeDelta: 150,
            // }}
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
                        image={{uri: getImageUrl(firstMovie.posterPath)}} // Use the image prop
                    >
                        {/*<Callout onPress={() => handleMarkerPress(country)}>*/}
                        {/*    <View style={styles.calloutContainer}>*/}
                        {/*        <Text style={styles.countryText}>{country}</Text>*/}
                        {/*        {movieCount > 1 && (*/}
                        {/*            <View style={styles.countBadge}>*/}
                        {/*                <Text style={styles.countText}>{movieCount}</Text>*/}
                        {/*            </View>*/}
                        {/*        )}*/}
                        {/*    </View>*/}
                        {/*</Callout>*/}
                        {/* Wrap labels in a custom View */}
                        <View style={styles.markerContainer}>
                            {/* Country Label */}
                            <View
                                style={[
                                    styles.countryLabel,
                                    {
                                        backgroundColor: CountryCoordinates[country]?.color || "black",
                                    },
                                ]}
                            >
                                <Text style={styles.countryText}>{country}</Text>
                            </View>
                            {/* Count Badge */}
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
        position: 'relative', // Set to relative
        alignItems: 'center', // Center children horizontally
    },
    countryLabel: {
        position: 'absolute',
        top: '100%', // Position it below the marker image
        marginTop: 5, // Add some space
        alignSelf: 'center',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 5,
    },
    countryText: {
        color: "white",
        fontWeight: "bold",
    },
    countBadge: {
        position: "absolute",
        top: -10, // Position it above the marker image
        right: -50, // Position it to the right of the marker image
        backgroundColor: "red",
        borderRadius: 15,
        width: 25,
        height: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    countText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
});