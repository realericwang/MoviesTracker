import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/globalStyles';
import { getImageUrl } from '../api/tmdbApi';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen({ route }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=a80f392256d3c7c3005432ab07b19299&language=en-US&append_to_response=credits`
      );
      const data = await response.json();
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  if (!movie) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: getImageUrl(movie.backdrop_path) }}
        style={styles.backdrop}
      />
      <View style={styles.headerOverlay} />
      
      <View style={styles.content}>
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: getImageUrl(movie.poster_path) }}
            style={styles.poster}
          />
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={() => setIsBookmarked(!isBookmarked)}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>{movie.title}</Text>
          <View style={styles.metadata}>
            <Text style={styles.year}>
              {new Date(movie.release_date).getFullYear()}
            </Text>
            <Text style={styles.runtime}>
              {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
            </Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {movie.vote_average.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.genres}>
            {movie.genres.map(genre => (
              <View key={genre.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overviewText}>{movie.overview}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movie.credits?.cast?.slice(0, 10).map(actor => (
                <View key={actor.id} style={styles.castMember}>
                  <Image
                    source={{ uri: getImageUrl(actor.profile_path) }}
                    style={styles.castImage}
                  />
                  <Text style={styles.castName} numberOfLines={2}>
                    {actor.name}
                  </Text>
                  <Text style={styles.characterName} numberOfLines={1}>
                    {actor.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Movie Info</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Director</Text>
              <Text style={styles.infoValue}>
                {movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Budget</Text>
              <Text style={styles.infoValue}>
                ${(movie.budget / 1000000).toFixed(1)}M
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Revenue</Text>
              <Text style={styles.infoValue}>
                ${(movie.revenue / 1000000).toFixed(1)}M
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{movie.status}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Production</Text>
              <Text style={styles.infoValue}>
                {movie.production_companies?.map(company => company.name).join(', ')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Countries</Text>
              <Text style={styles.infoValue}>
                {movie.production_countries?.map(country => country.name).join(', ')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdrop: {
    width: width,
    height: width * 0.56,
    position: 'absolute',
  },
  headerOverlay: {
    width: width,
    height: width * 0.56,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    marginTop: width * 0.4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.background,
    minHeight: 1000,
  },
  posterContainer: {
    marginTop: -80,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  poster: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  details: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  year: {
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  runtime: {
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  genreTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  overview: {
    marginTop: spacing.md,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  overviewText: {
    color: colors.textSecondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  castSection: {
    marginTop: spacing.lg,
  },
  castMember: {
    width: 100,
    marginRight: spacing.md,
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  characterName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
  section: {
    marginTop: spacing.lg,
  },
});
