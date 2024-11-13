import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/globalStyles';

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
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
});
