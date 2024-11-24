import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { colors, spacing } from "../styles/globalStyles";
import { auth } from "../firebase/firebaseSetup";
import { updateProfile } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { database } from "../firebase/firebaseSetup";
import { doc, setDoc, getDoc } from "firebase/firestore";
/**
 * EditProfileScreen Component
 *
 * This component allows authenticated users to edit their profile information,
 * including display name, profile picture, birthdate, and gender. Users can
 * upload a new profile image, select their birthdate using a date picker, and
 * choose their gender from predefined options. Upon saving, the updated information
 * is stored in Firebase Authentication and Firestore.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.navigation - Navigation object for navigating between screens.
 * @returns {React.Element} The rendered component.
 */
const EditProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [birthdate, setBirthdate] = useState(null);
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(database, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.birthdate) {
            setBirthdate(userData.birthdate.toDate());
          }
          if (userData.gender) {
            setGender(userData.gender);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
      });

      if (!result.canceled) {
        setLoading(true);
        const imageUri = result.assets[0].uri;
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const storage = getStorage();
        const imageRef = ref(storage, `profile_images/${user.uid}`);

        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        setPhotoURL(downloadURL);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });
      await setDoc(doc(database, "users", user.uid), {
        birthdate: birthdate,
        gender: gender,
      });
      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImagePick}
          disabled={loading}
        >
          <Image
            source={{
              uri: photoURL || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
          <View style={styles.imageOverlay}>
            <Ionicons name="camera" size={24} color={colors.background} />
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
          />

          <Text style={styles.label}>Email</Text>
          <Text style={styles.emailText}>{user?.email}</Text>

          <Text style={styles.label}>Birthdate</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            disabled={loading}
          >
            <Text style={[styles.inputText, !birthdate && styles.placeholder]}>
              {birthdate ? birthdate.toLocaleDateString() : "Select birthdate"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {["Male", "Female", "Other", "Prefer not to say"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  gender === option && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect(option)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    gender === option && styles.genderOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={birthdate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
  },
  saveButton: {
    padding: spacing.sm,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  imageContainer: {
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.background,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailText: {
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  genderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  genderOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  genderOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  genderOptionTextSelected: {
    color: colors.background,
  },
  inputText: {
    color: colors.text,
    fontSize: 16,
  },
  placeholder: {
    color: colors.textSecondary,
  },
});

export default EditProfileScreen;
