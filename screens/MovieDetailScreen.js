import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../styles/globalStyles";
import { getImageUrl, fetchMovieDetails } from "../api/tmdbApi";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebaseSetup";
import {
  writeToDB,
  deleteFromDB,
  updateDocInDB,
  getDocsByQueries,
} from "../firebase/firestoreHelper";
import { where } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function MovieDetailScreen({ route }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);

  /* bookmark related */
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarksID, setBookmarksID] = useState(null);

  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user = auth.currentUser;

  const fetchReviews = async () => {
    try {
      const reviewsData = await getDocsByQueries("reviews", [
        where("movieId", "==", movieId),
      ]);
      setReviews(reviewsData);
      reviewsData.sort((a, b) => b.timestamp - a.timestamp);
      setReviews(reviewsData);
      if (user) {
        const existingReview = reviewsData.find(
          (review) => review.userId === user.uid
        );
        setUserReview(existingReview || null);
      } else {
        setUserReview(null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
  const handleSubmitReview = async () => {
    if (!user) {
      navigation.navigate("Auth");
      return;
    }
    try {
      if (userReview) {
        await updateDocInDB(
          userReview.id,
          {
            text: reviewText,
            timestamp: Date.now(),
          },
          "reviews"
        );
      } else {
        await writeToDB(
          {
            movieId,
            userId: user.uid,
            userName: user.displayName || "Anonymous",
            text: reviewText,
            timestamp: Date.now(),
          },
          "reviews"
        );
      }
      setIsModalVisible(false);
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };
  const handleDeleteReview = async () => {
    try {
      await deleteFromDB(userReview.id, "reviews");
      setIsModalVisible(false);
      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };
  const handleBookmarkPress = async () => {
    if (!user) {
      Alert.alert("Login Required", "You need to login to bookmark movies", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Login",
          onPress: () => navigation.navigate("Auth"),
        },
      ]);
      return;
    }

    try {
      if (isBookmarked) {
        await deleteFromDB(bookmarksID, "bookmarks");
        setIsBookmarked(false);
        setBookmarksID(null);
      } else {
        // Check if the bookmark already exists
        const existingBookmark = await getDocsByQueries(
          "bookmarks",
          [where("movieId", "==", movieId), where("userId", "==", user.uid)],
          true
        );

        if (!existingBookmark) {
          const data = {
            movieId,
            userId: user.uid,
            movieTitle: movie.title,
            posterPath: movie.poster_path,
            timestamp: Date.now(),
          };
          await writeToDB(data, "bookmarks");
          setIsBookmarked(true);

          // Get the new bookmark ID
          const bookmarkData = await getDocsByQueries(
            "bookmarks",
            [where("movieId", "==", movieId), where("userId", "==", user.uid)],
            true
          );
          setBookmarksID(bookmarkData.id);
        }
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
    }
  };
  const checkIfBookmarked = async () => {
    if (!user) return;
    try {
      const bookmarkData = await getDocsByQueries(
        "bookmarks",
        [where("movieId", "==", movieId), where("userId", "==", user.uid)],
        true
      ); // Pass 'true' to get a single document
      if (bookmarkData && bookmarkData.userId === user.uid) {
        setIsBookmarked(true);
        setBookmarksID(bookmarkData.id);
      } else {
        setIsBookmarked(false);
        setBookmarksID(null);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
    checkIfBookmarked();
  }, [movieId]);

  useEffect(() => {
    if (isModalVisible) {
      setReviewText(userReview ? userReview.text : "");
    }
  }, [isModalVisible]);

  if (!movie) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
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
                onPress={handleBookmarkPress}
              >
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
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
              {movie.genres.map((genre) => (
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
                {movie.credits?.cast?.slice(0, 10).map((actor) => (
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
                  {movie.credits?.crew?.find(
                    (person) => person.job === "Director"
                  )?.name || "N/A"}
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
                  {movie.production_companies
                    ?.map((company) => company.name)
                    .join(", ")}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Countries</Text>
                <Text style={styles.infoValue}>
                  {movie.production_countries
                    ?.map((country) => country.name)
                    .join(", ")}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet.</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewContainer}>
                <Text style={styles.reviewUser}>{review.userName}</Text>
                <Text style={styles.reviewTimestamp}>
                  {new Date(review.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          if (!user) {
            navigation.navigate("Auth");
            return;
          }
          setIsModalVisible(true);
        }}
      >
        <Ionicons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {userReview ? "Edit Review" : "Write a Review"}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Write your review here..."
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSubmitReview}
              >
                <Text style={styles.modalButtonText}>
                  {userReview ? "Update" : "Submit"}
                </Text>
              </TouchableOpacity>
              {userReview && (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "red" }]}
                  onPress={handleDeleteReview}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    position: "absolute",
  },
  headerOverlay: {
    width: width,
    height: width * 0.56,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.4)",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  poster: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: "600",
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  overviewText: {
    color: colors.textSecondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  characterName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  infoSection: {
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    textAlign: "right",
  },
  section: {
    marginTop: spacing.lg,
  },

  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  textInput: {
    height: 100,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    textAlignVertical: "top",
    marginBottom: spacing.md,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noReviewsText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  reviewContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  reviewUser: {
    fontWeight: "bold",
    color: colors.text,
  },
  reviewTimestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  reviewText: {
    color: colors.text,
    lineHeight: 20,
  },
});
