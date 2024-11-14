import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase/firebaseSetup';
import { logout } from '../firebase/authHelper';

const AccountScreen = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => user ? console.log('Edit Profile pressed') : handleLogin(),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => user ? console.log('Notifications pressed') : handleLogin(),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => console.log('Settings pressed'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => console.log('Help pressed'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => console.log('About pressed'),
    },
  ];

  const renderHeader = () => {
    if (!user) {
      return (
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
            <View style={styles.profileInfo}>
              <Text style={styles.loginPrompt}>Login to access all features</Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Login / Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.displayName || 'User'}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name={item.icon} size={24} color={colors.text} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {user && (
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuSection: {
    marginTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  loginPrompt: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AccountScreen;
