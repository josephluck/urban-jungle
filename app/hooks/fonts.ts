import * as Font from "expo-font";
import { useEffect, useState } from "react";

export const CAROS_BLACK = "CAROS_BLACK";
export const CAROS_BOLD = "CAROS_BOLD";
export const CAROS_SEMIBOLD = "CAROS_SEMIBOLD";
export const CAROS_REGULAR = "CAROS_REGULAR";

export const useFonts = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        [CAROS_BLACK]: require("../assets/fonts/caros/CarosSoftBlack.otf"),
        [CAROS_BOLD]: require("../assets/fonts/caros/CarosSoftBold.otf"),
        [CAROS_SEMIBOLD]: require("../assets/fonts/caros/CarosSoftMedium.otf"),
        [CAROS_REGULAR]: require("../assets/fonts/caros/CarosSoft.otf"),
      });
      setLoading(false);
    };
    loadFonts();
  }, []);

  return loading;
};
