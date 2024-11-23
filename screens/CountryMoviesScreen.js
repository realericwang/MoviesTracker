import React from "react";
import { View, FlatList, StyleSheet, Text, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MovieCard from "../components/MovieCard";
import { colors, spacing } from "../styles/globalStyles";
import { MaterialIcons, Feather } from "@expo/vector-icons";

export default function CountryMoviesScreen({ route, navigation }) {
  const { country, movies, countryColor } = route.params;

  // Create dynamic styles that depend on countryColor
  const dynamicStyles = {
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: `${countryColor}15`,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.sm,
    },
  };

  // Transform bookmarked movie data to match TMDB format
  const transformedMovies = movies.map((movie) => ({
    id: movie.movieId,
    title: movie.movieTitle,
    poster_path: movie.posterPath,
    vote_average: movie.rating || 0, // Add a default rating if none exists
    release_date: movie.releaseDate,
  }));

  const handleMoviePress = (movie) => {
    navigation.navigate("MovieDetail", { movieId: movie.id });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[`${countryColor}CC`, `${countryColor}33`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.countryInfo}>
            <Feather name="map-pin" size={24} color={colors.white} />
            <Text style={styles.countryName}>{country}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={dynamicStyles.statIconContainer}>
                <Feather name="film" size={20} color={countryColor} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{movies.length}</Text>
                <Text style={styles.statLabel}>Movies</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={dynamicStyles.statIconContainer}>
                <Feather name="star" size={20} color={countryColor} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>
                  {(
                    movies.reduce((acc, cur) => acc + (cur.rating || 0), 0) /
                    movies.length
                  ).toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={transformedMovies}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MovieCard movie={item} onPress={() => handleMoviePress(item)} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    height: 180,
    marginBottom: spacing.xl,
    marginTop:spacing.xl
  },
  gradientHeader: {
    flex: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  headerContent: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  countryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  countryName: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "600",
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginHorizontal: spacing.xs,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.border,
    opacity: 0.5,
    alignSelf: "center",
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  cardWrapper: {
    width: (Dimensions.get("window").width - spacing.md * 3) / 2,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
});
