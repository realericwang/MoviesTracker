import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from './firebaseSetup';

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    let errorMessage = "An error occurred during signup";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password should be at least 6 characters";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address";
    }
    return { user: null, error: errorMessage };
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    let errorMessage = "An error occurred during login";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = "Invalid email or password";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address";
    }
    return { user: null, error: errorMessage };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: "An error occurred during logout" };
  }
};
