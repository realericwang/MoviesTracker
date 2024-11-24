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

const AboutScreen = () => {
  const navigation = useNavigation();

  const handleLinkPress = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="film-outline" size={80} color={colors.primary} />
          <Text style={styles.appName}>MoviesTracker</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About MoviesTracker</Text>
          <Text style={styles.description}>
            MoviesTracker is your personal film companion, designed to transform how
            you experience and share your cinematic adventures. Our app offers a
            rich, immersive way to discover, track, and remember each film you
            watch.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developers</Text>
          <Text style={styles.developerName}>Yichen Wang</Text>
          <Text style={styles.developerName}>Wangfan Qian</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Powered By</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLinkPress("https://www.themoviedb.org")}
          >
            <Text style={styles.linkText}>The Movie Database (TMDB)</Text>
            <Ionicons 
              name="open-outline" 
              size={16} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLinkPress("https://www.themoviedb.org/terms-of-use")}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLinkPress("https://www.themoviedb.org/privacy-policy")}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.textSecondary} 
            />
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
  logoContainer: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.md,
  },
  version: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  developerName: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    fontSize: 16,
    color: colors.text,
  },
});

export default AboutScreen;
