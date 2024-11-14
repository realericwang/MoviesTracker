import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors, spacing } from "../styles/globalStyles";
/**
 * MovieCategory component to display a category title and a horizontally scrollable list of movies.
 *
 * This component renders a category title and uses a horizontal ScrollView to display its children, typically MovieCard components.  It's designed for displaying a row of movie items within a larger screen layout.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the movie category.
 * @param {React.ReactNode} props.children - The children to be rendered within the horizontal ScrollView (typically MovieCard components).
 * @returns {JSX.Element} The MovieCategory component.
 */
export default function MovieCategory({ title, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
});
