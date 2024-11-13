import { View, Text } from 'react-native';
import globalStyles from '../styles/globalStyles';

export default function HomeScreen() {
  return (
    <View style={globalStyles.centerContainer}>
      <Text style={globalStyles.title}>Home Screen</Text>
    </View>
  );
}
import { View, Text, TextInput, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useState } from 'react';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { colors, spacing } from '../styles/globalStyles';

const MoviesTab = () => (
  <View style={styles.tabContent}>
    <Text>Movies Content</Text>
  </View>
);

const TVShowsTab = () => (
  <View style={styles.tabContent}>
    <Text>TV Shows Content</Text>
  </View>
);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'movies', title: 'Movies' },
    { key: 'tvshows', title: 'TV Shows' },
  ]);

  const renderScene = SceneMap({
    movies: MoviesTab,
    tvshows: TVShowsTab,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={{ backgroundColor: colors.background }}
      labelStyle={{ color: colors.text }}
      activeColor={colors.primary}
      inactiveColor={colors.textSecondary}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Box */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies or TV shows..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  tabView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
