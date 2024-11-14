import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../styles/globalStyles';
import { getImageUrl } from '../api/tmdbApi';

export default function MovieCard({ movie, onPress }) {
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={{ uri: getImageUrl(movie.poster_path) }}
        style={styles.poster}
      />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {movie.vote_average.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: spacing.md,
  },
  poster: {
    width: '100%',
    height: 210,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  info: {
    marginTop: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
