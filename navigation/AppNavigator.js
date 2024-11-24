import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/globalStyles";
import { auth } from "../firebase/firebaseSetup";
import { onAuthStateChanged } from "firebase/auth";
import { AuthStack } from "./AuthStack";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import BookmarksScreen from "../screens/BookmarksScreen";
import FootprintScreen from "../screens/FootprintScreen";
import AccountScreen from "../screens/AccountScreen";
import MovieDetailScreen from "../screens/MovieDetailScreen";
import TVShowDetailScreen from "../screens/TVShowDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import CountryMoviesScreen from "../screens/CountryMoviesScreen";
import CinemaDetailScreen from "../screens/CinemaDetailScreen";
/**
 * AppNavigator: Main navigation structure for the application.
 *
 * This component manages the overall navigation flow of the app, switching between
 * authenticated and unauthenticated states.  It uses a combination of `createStackNavigator` and
 * `createBottomTabNavigator` to create a tab bar for the main screens and a stack
 * navigator for nested screens and authentication flow.  It also handles checking user
 * authentication status using Firebase.
 *
 * @returns {JSX.Element} The main navigation structure of the app.
 */
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Bookmarks") {
            iconName = focused ? "bookmark" : "bookmark-outline";
          } else if (route.name === "Footprint") {
            iconName = focused ? "footsteps" : "footsteps-outline";
          } else if (route.name === "Account") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Footprint" component={FootprintScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="TVShowDetail" component={TVShowDetailScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen
        name="CountryMovies"
        component={CountryMoviesScreen}
        options={({ route }) => ({
          title: `Movies from ${route.params.country}`,
          headerTintColor: route.params.countryColor,
        })}
      />
      <Stack.Screen
        name="CinemaDetail"
        component={CinemaDetailScreen}
        options={{
          title: "Cinema Details",
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
