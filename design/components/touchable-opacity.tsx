import {
  Platform,
  TouchableOpacity as IosTouchableOpacity,
} from "react-native";
import { TouchableOpacity as AndroidTouchableOpacity } from "react-native-gesture-handler";

export const TouchableOpacity = Platform.select({
  ios: IosTouchableOpacity,
  android: AndroidTouchableOpacity as any,
  web: IosTouchableOpacity,
}) as typeof IosTouchableOpacity;
