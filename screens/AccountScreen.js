import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../styles/globalStyles";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebaseSetup";
import { logout } from "../firebase/authHelper";
import { onAuthStateChanged } from "firebase/auth";

const AccountScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      Alert.alert("Error", error);
    }
    navigation.navigate("Account");
  };

  const handleLogin = () => {
    navigation.navigate("Auth");
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      onPress: () =>
        user ? navigation.navigate("EditProfile") : handleLogin(),
    },
    {
      icon: "settings-outline",
      title: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      onPress: () => console.log("Help pressed"),
    },
    {
      icon: "information-circle-outline",
      title: "About",
      onPress: () => console.log("About pressed"),
    },
  ];

  const renderHeader = () => {
    if (!user) {
      return (
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <Ionicons
              name="triangle-outline"
              size={200}
              color={colors.background}
              style={{
                position: "absolute",
                right: -50,
                top: -50,
                transform: [{ rotate: "45deg" }],
              }}
            />
          </View>
          <View style={styles.profileSection}>
            <Ionicons
              name="person-circle-outline"
              size={90}
              color={colors.background}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.loginPrompt}>Welcome to MoviesTracker</Text>
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
        <View style={styles.headerBackground}>
          <Ionicons
            name="triangle-outline"
            size={200}
            color={colors.background}
            style={{
              position: "absolute",
              right: -50,
              top: -50,
              transform: [{ rotate: "45deg" }],
            }}
          />
        </View>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user.photoURL || "https://via.placeholder.com/100" }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.displayName || "User"}</Text>
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
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {user && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: spacing.lg,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: spacing.lg,
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.background,
    marginBottom: spacing.xs,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  email: {
    fontSize: 15,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  menuSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.error,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  loginPrompt: {
    fontSize: 20,
    color: colors.background,
    marginBottom: spacing.md,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "flex-start",
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    opacity: 0.1,
  },
});

export default AccountScreen;
