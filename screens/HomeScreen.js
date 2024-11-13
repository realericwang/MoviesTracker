import { View, Text } from 'react-native';
import globalStyles from '../styles/globalStyles';

export default function HomeScreen() {
  return (
    <View style={globalStyles.centerContainer}>
      <Text style={globalStyles.title}>Home Screen</Text>
    </View>
  );
}
