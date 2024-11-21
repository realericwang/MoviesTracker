import {useEffect, useState} from "react";
import MapView, {Marker} from "react-native-maps";
import {StyleSheet} from "react-native";
import Favicon from "../assets/favicon.png";
import {fetchPopularMovies, getImageUrl} from "../api/tmdbApi";
import {getAllDocs} from "../firebase/firestoreHelper";

// Hardcoded coordinates for certain countries
const countryCoordinates = {
    "Canada": {latitude: 56.1304, longitude: -106.3468},
    "United States of America": {latitude: 37.0902, longitude: -95.7129},
    "United Kingdom": {latitude: 55.3781, longitude: -3.4360},
    "France": {latitude: 46.6034, longitude: 1.8883},
    // Add more countries as needed
};

const Map = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [bookmarkedMovies, setBookmarkedMovies] = useState([]);

    useEffect(() => {
        // Function to load bookmarked movies from Firebase
        const loadBookmarkedMovies = async () => {
            try {
                // Fetch all bookmarked movies from Firestore
                const movies = await getAllDocs("bookmarks");
                setBookmarkedMovies(movies);
            } catch (error) {
                console.error("Error fetching bookmarked movies:", error);
            }
        };

        loadBookmarkedMovies(); // Load bookmarked movies when the component mounts
    }, []);

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
                        .filter((movie) => countryCoordinates[movie.productionCountries]) // Filter out movies without valid country mapping
                        .map((movie, index) => {
                            const country = movie.productionCountries;
                            const coordinates = countryCoordinates[country];

                            return (
                                <Marker
                                    key={index}
                                    coordinate={{
                                        latitude: coordinates.latitude,
                                        longitude: coordinates.longitude,
                                    }}
                                    image={{uri: getImageUrl(movie.posterPath)}}
                                    title={movie.movieTitle}
                                    description={`${movie.genres} - Directed by ${movie.director}`}
                                />
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
});