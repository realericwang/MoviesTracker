import {useEffect, useState} from "react";
import MapView, {Marker} from "react-native-maps";
import {StyleSheet, View, Text} from "react-native";
import Favicon from "../assets/favicon.png";
import {fetchPopularMovies, getImageUrl} from "../api/tmdbApi";
import {getAllDocs} from "../firebase/firestoreHelper";
import {Image as RNImage} from 'react-native';
import CountryCoordinates from "./common/CountryCoordinates";



const Map = ({navigation}) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
    // New state for counters
    // New state for country movie counts
    const [countryMovieCounts, setCountryMovieCounts] = useState({});


    useEffect(() => {
        // Function to load bookmarked movies from Firebase
        const loadBookmarkedMovies = async () => {
            try {
                // Fetch all bookmarked movies from Firestore
                const movies = await getAllDocs("bookmarks");
                setBookmarkedMovies(movies);
                // Count movies per country
                const movieCountsByCountry = movies.reduce((counts, movie) => {
                    const country = movie.productionCountries;
                    if (country) {
                        counts[country] = (counts[country] || 0) + 1;
                    }
                    return counts;
                }, {});

                setCountryMovieCounts(movieCountsByCountry);
            } catch (error) {
                console.error("Error fetching bookmarked movies:", error);
            }
        };

        loadBookmarkedMovies(); // Load bookmarked movies when the component mounts
    }, []);


    // Function to handle marker press
    const handleMarkerPress = (movie) => {
        if (movie.id) {
            console.log("Navigating to MovieDetail for movie:", movie);
            navigation.navigate("MovieDetail", { movieId: movie.id });
        } else {
            console.error("Movie ID is undefined. Cannot navigate to MovieDetail.");
        }
    };

    return (
        <>
            <MapView
                mapType="satellite"
                initialRegion={{
                    latitude: 49.2827, // Vancouver's latitude
                    longitude: -123.1207, // Vancouver's longitude
                    latitudeDelta: 115, // Increase this for a zoomed-out effect
                    longitudeDelta: 150, // Adjust for better globe view simulation
                }}

                style={styles.map}
                onPress={(e) => {
                    setSelectedLocation({
                        latitude: e.nativeEvent.coordinate.latitude,
                        longitude: e.nativeEvent.coordinate.longitude,
                    });
                }}
            >
                {bookmarkedMovies.length > 0 &&
                    bookmarkedMovies
                        .filter((movie) => CountryCoordinates[movie.productionCountries]) // Filter out movies without valid country mapping
                        .map((movie, index) => {
                            const country = movie.productionCountries;
                            const coordinates = CountryCoordinates[country];
                            const movieCount = countryMovieCounts[country] || 0;

                            return (
                                <Marker
                                    key={index}
                                    coordinate={{
                                        latitude: coordinates.latitude,
                                        longitude: coordinates.longitude,
                                    }}
                                    title={movie.movieTitle}
                                    description={` ${movie.genres} - Directed by ${movie.director}`}
                                    onPress={() => handleMarkerPress(movie)} // Navigate to movie detail on press
                                >
                                    >
                                    <View style={styles.markerContainer}>
                                        <RNImage
                                            source={{uri: getImageUrl(movie.posterPath)}}
                                            style={styles.poster}
                                        />
                                        <View
                                            style={[styles.countryName, {backgroundColor: CountryCoordinates[country]?.color || 'black'}]}>
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
    )
}

export default Map;


const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    markerContainer: {
        position: 'relative',
    },
    poster: {
        width: 100,
        height: 150,
        borderRadius: 15,
    },
    countBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'red',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        color: 'white',
        fontWeight: 'bold',
    },
    countryName: {
        backgroundColor: 'yellow',
        padding: 5,
        borderRadius: 5,
        position: 'absolute',
        left: -15,
        top: 5,
    },
});