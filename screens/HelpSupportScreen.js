import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../styles/globalStyles";
import { useNavigation } from "@react-navigation/native";

const HelpSupportScreen = () => {
  const navigation = useNavigation();

  const faqItems = [
    {
      question: "How do I search for movies?",
      answer:
        "Use the search bar at the top of the Home screen to find movies and TV shows. Type at least 2 characters to start searching.",
    },
    {
      question: "How do I bookmark a movie?",
      answer:
        "Open a movie's details page and tap the bookmark icon in the top right corner. You'll need to be logged in to use this feature.",
    },
    {
      question: "How do I edit my profile?",
      answer:
        "Go to the Account tab and tap 'Edit Profile'. Here you can change your display name, profile picture, and other information.",
    },
    {
      question: "Can I watch movies in the app?",
      answer:
        "MoviesTracker is a movie tracking app and doesn't provide movie streaming services. We help you discover and track movies you want to watch.",
    },
  ];

  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@moviestracker.com");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleEmailSupport}
          >
            <View style={styles.supportButtonContent}>
              <Ionicons
                name="mail-outline"
                size={24}
                color={colors.background}
              />
              <Text style={styles.supportButtonText}>Email Support</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  faqItem: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  answer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  supportButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  supportButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
});

export default HelpSupportScreen;
