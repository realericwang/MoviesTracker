import "react-native-gesture-handler";
import {StatusBar} from "expo-status-bar";
import {NavigationContainer} from "@react-navigation/native";
import {AppNavigator} from "./navigation/AppNavigator";
import {SafeAreaProvider} from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});
export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AppNavigator/>
                <StatusBar style="auto"/>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
