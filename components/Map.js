import React, { useState, useEffect, useCallback } from "react";
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

      console.log("User location:", { latitude, longitude });

      setUserLocation(location.coords);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const nearbyCinemas = await fetchNearbyCinemas(latitude, longitude);
      console.log(
        "First cinema coordinates:",
        nearbyCinemas[0]?.geometry.location
      );

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
    return null;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {cinemas.map((cinema) => (
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
