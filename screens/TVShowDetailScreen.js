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
import { fetchTVShowDetails, getImageUrl } from "../api/tmdbApi";
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
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");
/**
 * TVShowDetailScreen component to display details of a TV show.
 *
 * This component fetches and displays detailed information about a specific TV show,
 * including its title, overview, cast, seasons, and ratings.  It handles loading and error states.
 * Uses TMDB API to fetch TV show details and image URLs.
 *
 * @param {object} route - React Navigation's route prop.
 * @param {number} route.params.showId - The ID of the TV show to display.
 * @returns {JSX.Element} The TVShowDetailScreen component.
 */
export default function TVShowDetailScreen({ route }) {
  const { showId } = route.params;
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarksID, setBookmarksID] = useState(null);
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user = auth.currentUser;
  const [reviewImage, setReviewImage] = useState(null);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const loadShowDetails = async () => {
      try {
        const details = await fetchTVShowDetails(showId);
        setShow(details);
      } catch (error) {
        console.error("Error loading TV show details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadShowDetails();
    fetchReviews();
    checkIfBookmarked();
  }, [showId]);

  useEffect(() => {
    if (isModalVisible) {
      setReviewText(userReview ? userReview.text : "");
    }
  }, [isModalVisible]);

  const fetchReviews = async () => {
    try {
      const reviewsData = await getDocsByQueries("tvshowreviews", [
        where("showId", "==", showId),
      ]);
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
          `tvshow_review_images/${user.uid}/${Date.now()}`
        );
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      const reviewData = {
        showId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        text: reviewText,
        timestamp: Date.now(),
        imageUrl,
      };

      if (userReview) {
        await updateDocInDB(
          userReview.id,
          {
            text: reviewText,
            timestamp: Date.now(),
            imageUrl: imageUrl || userReview.imageUrl,
          },
          "tvshowreviews"
        );
      } else {
        await writeToDB(reviewData, "tvshowreviews");
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
      await deleteFromDB(userReview.id, "tvshowreviews");
      setIsModalVisible(false);
      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleBookmarkPress = async () => {
    if (!user) {
      Alert.alert("Login Required", "You need to login to bookmark TV shows", [
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
          await deleteFromDB(bookmarkIdToDelete, "tvshowbookmarks");
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
            "tvshowbookmarks",
            [where("showId", "==", showId), where("userId", "==", user.uid)],
            true
          );
          if (!existingBookmark) {
            const data = {
              showId,
              userId: user.uid,
              userName: user.displayName || "Anonymous",
              showTitle: show.name,
              posterPath: show.poster_path,
              backdropPath: show.backdrop_path,
              firstAirDate: show.first_air_date,
              genres: show.genres?.map((g) => g.name).join(", "),
              numberOfSeasons: show.number_of_seasons,
              numberOfEpisodes: show.number_of_episodes,
              voteAverage: show.vote_average,
              overview: show.overview,
              creator: show.created_by?.[0]?.name || "Unknown",
              cast: show.credits?.cast?.slice(0, 10).map((actor) => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profilePath: actor.profile_path,
              })),
              status: show.status,
              networks:
                show.networks?.map((network) => network.name).join(", ") ||
                "Unknown",
              productionCountries:
                show.production_countries?.[0]?.iso_3166_1 || "Unknown",
              timestamp: Date.now(),
            };

            await writeToDB(data, "tvshowbookmarks");

            const bookmarkData = await getDocsByQueries(
              "tvshowbookmarks",
              [where("showId", "==", showId), where("userId", "==", user.uid)],
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
        "tvshowbookmarks",
        [where("showId", "==", showId), where("userId", "==", user.uid)],
        true
      );
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

  const scheduleReminder = async (showTitle, date) => {
    try {
      // Check if selected date is in the past
      if (date.getTime() <= new Date().getTime()) {
        Alert.alert(
          "Invalid Time",
          "Please select a future time for the reminder"
        );
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please enable notifications to set reminders"
        );
        return;
      }

      const trigger = date;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "TV Show Reminder",
          body: `Time to watch ${showTitle}!`,
          data: { showId },
        },
        trigger,
      });

      Alert.alert(
        "Reminder set",
        `We'll remind you to watch ${showTitle} on ${date.toLocaleString()}`
      );
      setIsReminderModalVisible(false);
    } catch (error) {
      console.error("Error setting reminder:", error);
      Alert.alert("Error", "Failed to set reminder. Please try again.");
    }
  };

  const setTimeToNextHour = () => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return nextHour;
  };

  const validateAndUpdateTime = (selectedDate) => {
    const now = new Date();
    if (
      selectedDate.toDateString() === now.toDateString() &&
      selectedDate.getTime() <= now.getTime()
    ) {
      Alert.alert(
        "Invalid Time",
        "Please select a future time for the reminder"
      );
      return setTimeToNextHour();
    }
    return selectedDate;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load TV show details</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Image
          source={{ uri: getImageUrl(show.backdrop_path) }}
          style={styles.backdrop}
        />
        <View style={styles.headerOverlay} />

        <View style={styles.content}>
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: getImageUrl(show.poster_path) }}
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
                        {
                          text: "Login",
                          onPress: () => navigation.navigate("Auth"),
                        },
                      ]
                    );
                    return;
                  }
                  setIsReminderModalVisible(true);
                }}
              >
                <Ionicons
                  name="alarm-outline"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.details}>
            <Text style={styles.title}>{show.name}</Text>
            <View style={styles.metadata}>
              <Text style={styles.year}>
                {new Date(show.first_air_date).getFullYear()}
              </Text>
              <Text style={styles.episodes}>
                {show.number_of_seasons} Season
                {show.number_of_seasons !== 1 ? "s" : ""}
              </Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {show.vote_average.toFixed(1)}
                </Text>
              </View>
            </View>
            <View style={styles.genres}>
              {show.genres.map((genre) => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overviewText}>{show.overview}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {show.credits?.cast?.slice(0, 10).map((actor) => (
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Latest Season</Text>
              {show.seasons?.length > 0 && (
                <View style={styles.seasonInfo}>
                  <Text style={styles.seasonTitle}>
                    {show.seasons[show.seasons.length - 1].name}
                  </Text>
                  <Text style={styles.episodeCount}>
                    {show.seasons[show.seasons.length - 1].episode_count}{" "}
                    Episodes
                  </Text>
                  {show.seasons[show.seasons.length - 1].air_date && (
                    <Text style={styles.airDate}>
                      Aired:{" "}
                      {new Date(
                        show.seasons[show.seasons.length - 1].air_date
                      ).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} style={styles.reviewContainer}>
                    <Text style={styles.reviewUser}>{review.userName}</Text>
                    <Text style={styles.reviewTimestamp}>
                      {new Date(review.timestamp).toLocaleDateString()}
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
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
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
                placeholderTextColor={colors.textSecondary}
                multiline
                value={reviewText}
                onChangeText={setReviewText}
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
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => handleImagePick("camera")}
                >
                  <Ionicons
                    name="camera-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.imageButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => handleImagePick("library")}
                >
                  <Ionicons
                    name="image-outline"
                    size={20}
                    color={colors.primary}
                  />
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
        <TouchableWithoutFeedback
          onPress={() => setIsReminderModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Watch Reminder</Text>
                <Text style={styles.modalDescription}>
                  Choose when you'd like to be reminded to watch "{show.name}"
                </Text>

                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      setShowDatePicker(!showDatePicker);
                      setShowTimePicker(false);
                    }}
                  >
                    <View style={styles.dateTimeButtonContent}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color={colors.primary}
                      />
                      <View style={styles.dateTimeTextContainer}>
                        <Text style={styles.dateTimeLabel}>Date</Text>
                        <Text style={styles.dateTimeValue}>
                          {reminderDate.toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      setShowTimePicker(!showTimePicker);
                      setShowDatePicker(false);
                    }}
                  >
                    <View style={styles.dateTimeButtonContent}>
                      <Ionicons
                        name="time-outline"
                        size={24}
                        color={colors.primary}
                      />
                      <View style={styles.dateTimeTextContainer}>
                        <Text style={styles.dateTimeLabel}>Time</Text>
                        <Text style={styles.dateTimeValue}>
                          {reminderDate.toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={reminderDate}
                        mode="date"
                        display="spinner"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            const now = new Date();
                            const selected = new Date(selectedDate);

                            // If selected date is today, ensure current time hasn't passed
                            if (
                              selected.toDateString() === now.toDateString()
                            ) {
                              const currentReminderTime = new Date(
                                reminderDate
                              );
                              if (
                                currentReminderTime.getTime() <= now.getTime()
                              ) {
                                setReminderDate(setTimeToNextHour());
                                return;
                              }
                            }
                            setReminderDate(selectedDate);
                          }
                        }}
                        style={styles.picker}
                        textColor={colors.text}
                        themeVariant="light"
                      />
                    </View>
                  )}

                  {showTimePicker && (
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={reminderDate}
                        mode="time"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                          setShowTimePicker(false);
                          if (selectedDate) {
                            const validatedDate =
                              validateAndUpdateTime(selectedDate);
                            setReminderDate(validatedDate);
                          }
                        }}
                        style={styles.picker}
                        textColor={colors.text}
                        themeVariant="light"
                      />
                    </View>
                  )}
                </View>

                <View style={styles.reminderPreview}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.reminderPreviewText}>
                    Reminder will be set for {reminderDate.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => {
                      const now = new Date();
                      if (reminderDate.getTime() <= now.getTime()) {
                        Alert.alert(
                          "Invalid Time",
                          "Please select a future time for the reminder"
                        );
                        setReminderDate(setTimeToNextHour());
                        return;
                      }
                      scheduleReminder(show.name, reminderDate);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Set Reminder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => setIsReminderModalVisible(false)}
                  >
                    <Text
                      style={[styles.modalButtonText, { color: colors.text }]}
                    >
                      Cancel
                    </Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  backdrop: {
    width: "100%",
    height: 250,
    backgroundColor: colors.border,
  },
  details: {
    padding: spacing.md,
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
    marginBottom: spacing.sm,
  },
  year: {
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  episodes: {
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
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  genreTag: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  genreText: {
    color: colors.primary,
    fontSize: 12,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  overviewText: {
    color: colors.text,
    lineHeight: 20,
  },
  castMember: {
    width: 100,
    marginRight: spacing.sm,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  castName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text,
    marginTop: spacing.xs,
  },
  characterName: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  seasonInfo: {
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: 8,
  },
  seasonTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  episodeCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  airDate: {
    fontSize: 14,
    color: colors.textSecondary,
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
  dateTimeContainer: {
    marginBottom: spacing.lg,
  },
  dateTimeButton: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  dateTimeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeTextContainer: {
    marginLeft: spacing.md,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  reminderPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.surface}80`,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  reminderPreviewText: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  pickerContainer: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: `${colors.primary}30`,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  picker: {
    height: 120,
    marginHorizontal: -spacing.md,
    backgroundColor: colors.background,
  },
  posterContainer: {
    marginTop: -50,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkButton: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
