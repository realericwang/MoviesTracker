import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

import HomeScreen from '../screens/HomeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import FootprintScreen from '../screens/FootprintScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookmarks') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Footprint') {
            iconName = focused ? 'footsteps' : 'footsteps-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Footprint" component={FootprintScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
