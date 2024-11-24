import React, { useState, useEffect } from "react";
import MapView from "react-native-maps";
import { StyleSheet, View } from "react-native";
import { colors } from "../styles/globalStyles";
import * as Location from "expo-location";
import { fetchNearbyCinemas } from "../api/googlePlacesApi";
import CinemaMarker from "./CinemaMarker";

const Map = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [region, setRegion] = useState(null);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation(location.coords);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const nearbyCinemas = await fetchNearbyCinemas(latitude, longitude);
      setCinemas(nearbyCinemas);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleCinemaPress = (cinema) => {
    navigation.navigate("CinemaDetail", { cinema });
  };

  if (!region) {
    return null; // or a loading spinner
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={setRegion}
      >
        {cinemas.length > 0 &&
          cinemas.map((cinema) => (
            <CinemaMarker
              key={cinema.place_id}
              cinema={cinema}
              onPress={handleCinemaPress}
            />
          ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Map;
