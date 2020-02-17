import { store } from "./state";
import { Animated } from "react-native";

/**
 * SELECTORS
 */

export const selectHomeScroll = store.createSelector(
  (s): Animated.Value => s.ui.homeScroll
);
