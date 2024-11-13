import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, Animated, Dimensions, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/globalStyles';
import { getImageUrl } from '../api/tmdbApi';

export default function BannerRotator({ movies }) {
  const scrollX = new Animated.Value(0);
  const { width } = Dimensions.get('window');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    let scrollInterval;
    if (movies.length > 0) {
      let currentIndex = 0;
      scrollInterval = setInterval(() => {
        if (currentIndex < movies.length - 1) {
          currentIndex += 1;
        } else {
          currentIndex = 0;
        }
        scrollViewRef.current?.scrollTo({
          x: currentIndex * width,
          animated: true,
        });
      }, 5000);
    }
    return () => clearInterval(scrollInterval);
  }, [movies]);

  return (
    <View style={styles.bannerContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {movies.map((movie, index) => (
          <View key={movie.id} style={[styles.bannerSlide, { width }]}>
            <Image
              source={{ uri: getImageUrl(movie.backdrop_path) }}
              style={styles.bannerImage}
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{movie.title}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>★ {movie.vote_average.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {movies.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 300,
    position: 'relative',
  },
  bannerSlide: {
    height: 300,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#FFF',
    fontSize: 16,
    marginRight: spacing.sm,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
  },
});
