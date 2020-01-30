import { useState, useEffect } from "react";
import * as Font from "expo-font";

export const SOURCE_SANS_BLACK = "SOURCE_SANS_BLACK";
export const SOURCE_SANS_BLACK_ITALIC = "SOURCE_SANS_BLACK_ITALIC";
export const SOURCE_SANS_BOLD = "SOURCE_SANS_BOLD";
export const SOURCE_SANS_BOLD_ITALIC = "SOURCE_SANS_BOLD_ITALIC";
export const SOURCE_SANS_SEMIBOLD = "SOURCE_SANS_SEMIBOLD";
export const SOURCE_SANS_SEMIBOLD_ITALIC = "SOURCE_SANS_SEMIBOLD_ITALIC";
export const SOURCE_SANS_REGULAR = "SOURCE_SANS_REGULAR";
export const SOURCE_SANS_REGULAR_ITALIC = "SOURCE_SANS_REGULAR_ITALIC";

export const useFonts = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        [SOURCE_SANS_BLACK]: require("../assets/fonts/source-sans/SourceSansPro-Black.ttf"),
        [SOURCE_SANS_BLACK_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-BlackItalic.ttf"),
        [SOURCE_SANS_BOLD]: require("../assets/fonts/source-sans/SourceSansPro-Bold.ttf"),
        [SOURCE_SANS_BOLD_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-BoldItalic.ttf"),
        [SOURCE_SANS_SEMIBOLD]: require("../assets/fonts/source-sans/SourceSansPro-SemiBold.ttf"),
        [SOURCE_SANS_SEMIBOLD_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-SemiBoldItalic.ttf"),
        [SOURCE_SANS_REGULAR]: require("../assets/fonts/source-sans/SourceSansPro-Regular.ttf"),
        [SOURCE_SANS_REGULAR_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-Italic.ttf")
      });
      setLoading(false);
    };
    loadFonts();
  }, []);

  return loading;
};
