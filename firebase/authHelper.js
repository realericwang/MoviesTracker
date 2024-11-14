import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseSetup";

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    let errorMessage = "An error occurred during signup";
    if (error.code === "auth/email-already-exists") {
      errorMessage = "This email is already registered";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password should be at least 6 characters";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    }
    return { user: null, error: errorMessage };
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    let errorMessage;

    switch (error.code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":
        errorMessage = "Invalid email or password. Please try again.";
        break;
      case "auth/invalid-email":
        errorMessage = "The email address is not valid. Please enter a valid email.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many unsuccessful login attempts. Please try again later or reset your password.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection and try again.";
        break;
      default:
        errorMessage = "An unexpected error occurred. Please try again.";
        console.error("Login Error:", error); // Log unexpected errors for debugging
    }

    return { user: null, error: errorMessage };
  }
}

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: "An error occurred during logout" };
  }
};
