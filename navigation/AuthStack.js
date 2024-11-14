import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createStackNavigator();
/**
 * AuthStack navigator for authentication screens.
 *
 * This component defines a navigation stack for the login and signup screens.
 * It uses `createStackNavigator` to manage navigation between these screens.
 * The `headerShown: false` option hides the default header for a cleaner look.
 *
 * @returns {JSX.Element} The AuthStack navigator.
 */
export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
