import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { colors, spacing } from "../styles/globalStyles";
import { signUp } from "../firebase/authHelper";
import { Ionicons } from "@expo/vector-icons";

/**
 * SignUpScreen Component
 *
 * This component provides a user interface for new users to create an account.
 * It includes input fields for email, password, and password confirmation.
 * Upon successful sign-up, users are navigated to the "Account" screen.
 * It handles validation for empty fields and password matching,
 * and provides feedback through alerts and loading indicators.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.navigation - Navigation object for navigating between screens.
 * @returns {React.Element} The rendered SignUpScreen component.
 */
const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: colors.error,
  });

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = colors.error;

    // Length check
    if (password.length >= 8) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char

    // Set message and color based on score
    switch (score) {
      case 0:
      case 1:
        message = "Very Weak";
        color = colors.error;
        break;
      case 2:
        message = "Weak";
        color = "#FFA500"; // Orange
        break;
      case 3:
        message = "Medium";
        color = "#FFD700"; // Gold
        break;
      case 4:
        message = "Strong";
        color = "#90EE90"; // Light green
        break;
      case 5:
        message = "Very Strong";
        color = colors.success;
        break;
    }

    setPasswordStrength({ score, message, color });
    return score;
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // Enhanced password validation
    const strengthScore = checkPasswordStrength(password);
    if (strengthScore < 3) {
      Alert.alert(
        "Weak Password",
        "Your password is not strong enough. Please include:\n" +
          "• At least 8 characters\n" +
          "• Uppercase and lowercase letters\n" +
          "• Numbers\n" +
          "• Special characters (!@#$%^&*)",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use Anyway",
            onPress: () => performSignUp(),
            style: "destructive",
          },
        ]
      );
      return;
    }

    performSignUp();
  };

  const performSignUp = async () => {
    setLoading(true);
    try {
      const { user, error } = await signUp(email, password);
      if (error) {
        Alert.alert("Error", error);
      } else {
        navigation.navigate("Account");
      }
    } catch (error) {
      console.error("SignUp Error: ", error);
      const message = error.code
        ? error.message
        : "An unexpected error occurred during sign up.";
      Alert.alert("Sign Up Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              checkPasswordStrength(text);
            }}
            secureTextEntry
            editable={!loading}
          />
          {password.length > 0 && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor:
                          index <= passwordStrength.score
                            ? passwordStrength.color
                            : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text
                style={[styles.strengthText, { color: passwordStrength.color }]}
              >
                {passwordStrength.message}
              </Text>
            </View>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          disabled={loading}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  backButton: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    padding: spacing.sm,
    zIndex: 1,
  },
  passwordStrengthContainer: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  strengthBar: {
    flexDirection: "row",
    height: 4,
    marginBottom: spacing.xs,
  },
  strengthSegment: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    textAlign: "right",
  },
});

export default SignUpScreen;
