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
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../styles/globalStyles";
import {
  getImageUrl,
  fetchMovieDetails as fetchMovieFromAPI,
} from "../api/tmdbApi";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebaseSetup";
import {
  writeToDB,
  deleteFromDB,
  updateDocInDB,
  getDocsByQueries,
} from "../firebase/firestoreHelper";
import { where } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get("window");

/**
 * MovieDetailScreen Component
 *
 * This component displays detailed information about a specific movie, including its
 * poster, backdrop, overview, cast, genres, and additional movie info. Users can
 * bookmark the movie, write reviews, edit their existing reviews, and view all reviews
 * associated with the movie. It interacts with Firebase for authentication and Firestore
 * for storing bookmarks and reviews.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.route - Route object containing parameters.
 * @param {Object} props.route.params - Route parameters.
 * @param {string} props.route.params.movieId - The ID of the movie to display details for.
 * @returns {React.Element} The rendered MovieDetailScreen component.
 */
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

  const [isLoading, setIsLoading] = useState(true);

  const [reviewImage, setReviewImage] = useState(null);

  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      let imageUrl = null;
      if (reviewImage) {
        const response = await fetch(reviewImage);
        const blob = await response.blob();
        const storage = getStorage();
        const imageRef = ref(
          storage,
          `review_images/${user.uid}_${Date.now()}`
        );
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (userReview) {
        await updateDocInDB(
          userReview.id,
          {
            text: reviewText,
            timestamp: Date.now(),
            imageUrl: imageUrl || userReview.imageUrl,
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
            imageUrl,
          },
          "reviews"
        );
      }
      setIsModalVisible(false);
      setReviewImage(null);
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
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
        // Optimistically update UI
        setIsBookmarked(false);
        const bookmarkIdToDelete = bookmarksID;
        setBookmarksID(null);

        // Handle backend in background
        try {
          await deleteFromDB(bookmarkIdToDelete, "bookmarks");
        } catch (error) {
          // Revert UI if backend fails
          console.error("Error deleting bookmark:", error);
          setIsBookmarked(true);
          setBookmarksID(bookmarkIdToDelete);
        }
      } else {
        // Optimistically update UI
        setIsBookmarked(true);

        // Handle backend in background
        try {
          const existingBookmark = await getDocsByQueries(
            "bookmarks",
            [where("movieId", "==", movieId), where("userId", "==", user.uid)],
            true
          );
          if (!existingBookmark) {
            const data = {
              movieId,
              userId: user.uid,
              userName: user.displayName || "Anonymous",
              movieTitle: movie.title,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path,
              releaseDate: movie.release_date,
              genres: movie.genres?.map((g) => g.name).join(", "),
              runtime: movie.runtime,
              voteAverage: movie.vote_average,
              overview: movie.overview,
              director:
                movie.credits?.crew?.find((person) => person.job === "Director")
                  ?.name || "Unknown",
              cast: movie.credits?.cast?.slice(0, 10).map((actor) => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profilePath: actor.profile_path,
              })),
              budget: movie.budget,
              revenue: movie.revenue,
              status: movie.status,
              productionCompanies:
                movie.production_companies
                  ?.map((company) => company.name)
                  .join(", ") || "Unknown",
              productionCountries:
                movie.production_countries?.[0]?.iso_3166_1 || "Unknown",
              timestamp: Date.now(),
            };

            await writeToDB(data, "bookmarks");

            // Get the new bookmark ID
            const bookmarkData = await getDocsByQueries(
              "bookmarks",
              [
                where("movieId", "==", movieId),
                where("userId", "==", user.uid),
              ],
              true
            );
            setBookmarksID(bookmarkData.id);
          }
        } catch (error) {
          // Revert UI if backend fails
          console.error("Error adding bookmark:", error);
          setIsBookmarked(false);
          setBookmarksID(null);
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

  const loadMovieDetails = async () => {
    try {
      const movieData = await fetchMovieFromAPI(movieId);
      setMovie(movieData);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovieDetails();
    fetchReviews();
    checkIfBookmarked();
  }, [movieId]);

  useEffect(() => {
    if (isModalVisible) {
      setReviewText(userReview ? userReview.text : "");
    }
  }, [isModalVisible]);

  const handleImagePick = async (type) => {
    try {
      let result;
      if (type === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Camera permission is required to take photos"
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.2,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.3,
        });
      }

      if (!result.canceled) {
        setReviewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const scheduleReminder = async (movieTitle, date) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please enable notifications to set reminders');
        return;
      }

      const trigger = date;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Movie Reminder',
          body: `Time to watch ${movieTitle}!`,
          data: { movieId },
        },
        trigger,
      });

      Alert.alert('Reminder set', `We'll remind you to watch ${movieTitle} on ${date.toLocaleString()}`);
    } catch (error) {
      console.error('Error setting reminder:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
    }
  };

  if (isLoading || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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
              <TouchableOpacity
                style={[styles.bookmarkButton, { marginLeft: 10 }]}
                onPress={() => {
                  if (!user) {
                    Alert.alert(
                      "Login Required",
                      "You need to login to set reminders",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Login", onPress: () => navigation.navigate("Auth") }
                      ]
                    );
                    return;
                  }
                  setIsReminderModalVisible(true);
                }}
              >
                <Ionicons name="alarm-outline" size={24} color={colors.primary} />
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
                  {(movie.vote_average ?? 0).toFixed(1)}
                </Text>
              </View>
            </View>
            <View style={styles.genres}>
              {(movie.genres || []).map((genre) => (
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
                {(movie.credits?.cast || []).slice(0, 10).map((actor) => (
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
        <View style={styles.reviewsSection}>
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
                {review.imageUrl && (
                  <Image
                    source={{ uri: review.imageUrl }}
                    style={styles.reviewImage}
                  />
                )}
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
            Alert.alert(
              "Login Required",
              "You need to login to write reviews",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Login",
                  onPress: () => navigation.navigate("Auth"),
                },
              ]
            );
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
        onRequestClose={() => {
          setIsModalVisible(false);
          setReviewImage(null);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
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
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={true}
              />

              {reviewImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: reviewImage }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setReviewImage(null)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => handleImagePick("camera")}
                >
                  <Ionicons name="camera" size={24} color={colors.primary} />
                  <Text style={styles.imageButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => handleImagePick("library")}
                >
                  <Ionicons name="images" size={24} color={colors.primary} />
                  <Text style={styles.imageButtonText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>

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
                  onPress={() => {
                    setIsModalVisible(false);
                    setReviewImage(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={isReminderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsReminderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsReminderModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Reminder</Text>
                
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                  <Text style={styles.datePickerButtonText}>
                    {reminderDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={24} color={colors.primary} />
                  <Text style={styles.datePickerButtonText}>
                    {reminderDate.toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>

                {(showDatePicker || showTimePicker) && (
                  <DateTimePicker
                    value={reminderDate}
                    mode={showDatePicker ? 'date' : 'time'}
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setReminderDate(selectedDate);
                      }
                      setShowDatePicker(false);
                      setShowTimePicker(false);
                    }}
                  />
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      scheduleReminder(movie.title, reminderDate);
                      setIsReminderModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Set Reminder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setIsReminderModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  content: {
    marginTop: width * 0.4,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: colors.background,
    minHeight: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
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
    borderRadius: 12,
    backgroundColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    borderRadius: 20,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
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
    marginTop: spacing.xs,
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
    marginTop: spacing.xs,
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: "80%",
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
    backgroundColor: `${colors.surface}50`,
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
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.8,
  },
  reviewContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: `${colors.primary}15`,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  reviewTimestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  reviewText: {
    color: colors.text,
    lineHeight: 22,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  imagePreviewContainer: {
    marginVertical: spacing.md,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  imageButtonText: {
    color: colors.primary,
    marginLeft: spacing.xs,
    fontSize: 14,
  },
  reviewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  datePickerButtonText: {
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
});
