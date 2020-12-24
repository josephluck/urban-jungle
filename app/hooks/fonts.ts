import * as Font from "expo-font";
import { useState, useEffect } from "react";

// export const SOURCE_SANS_BLACK = "SOURCE_SANS_BLACK";
// export const SOURCE_SANS_BLACK_ITALIC = "SOURCE_SANS_BLACK_ITALIC";
// export const SOURCE_SANS_BOLD = "SOURCE_SANS_BOLD";
// export const SOURCE_SANS_BOLD_ITALIC = "SOURCE_SANS_BOLD_ITALIC";
// export const SOURCE_SANS_SEMIBOLD = "SOURCE_SANS_SEMIBOLD";
// export const SOURCE_SANS_SEMIBOLD_ITALIC = "SOURCE_SANS_SEMIBOLD_ITALIC";
// export const SOURCE_SANS_REGULAR = "SOURCE_SANS_REGULAR";
// export const SOURCE_SANS_REGULAR_ITALIC = "SOURCE_SANS_REGULAR_ITALIC";

// export const RUBIK_BLACK = "RUBIK_BLACK";
// export const RUBIK_BLACK_ITALIC = "RUBIK_BLACK_ITALIC";
// export const RUBIK_BOLD = "RUBIK_BOLD";
// export const RUBIK_BOLD_ITALIC = "RUBIK_BOLD_ITALIC";
// export const RUBIK_SEMIBOLD = "RUBIK_SEMIBOLD";
// export const RUBIK_SEMIBOLD_ITALIC = "RUBIK_SEMIBOLD_ITALIC";
// export const RUBIK_REGULAR = "RUBIK_REGULAR";
// export const RUBIK_REGULAR_ITALIC = "RUBIK_REGULAR_ITALIC";

// export const NUNITO_BLACK = "NUNITO_BLACK";
// export const NUNITO_BLACK_ITALIC = "NUNITO_BLACK_ITALIC";
// export const NUNITO_BOLD = "NUNITO_BOLD";
// export const NUNITO_BOLD_ITALIC = "NUNITO_BOLD_ITALIC";
// export const NUNITO_SEMIBOLD = "NUNITO_SEMIBOLD";
// export const NUNITO_SEMIBOLD_ITALIC = "NUNITO_SEMIBOLD_ITALIC";
// export const NUNITO_REGULAR = "NUNITO_REGULAR";
// export const NUNITO_REGULAR_ITALIC = "NUNITO_REGULAR_ITALIC";

export const CAROS_BLACK = "CAROS_BLACK";
export const CAROS_BOLD = "CAROS_BOLD";
export const CAROS_SEMIBOLD = "CAROS_SEMIBOLD";
export const CAROS_REGULAR = "CAROS_REGULAR";

export const useFonts = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        // SOURCE SANS PRO
        // [SOURCE_SANS_BLACK]: require("../assets/fonts/source-sans/SourceSansPro-Black.ttf"),
        // [SOURCE_SANS_BLACK_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-BlackItalic.ttf"),
        // [SOURCE_SANS_BOLD]: require("../assets/fonts/source-sans/SourceSansPro-Bold.ttf"),
        // [SOURCE_SANS_BOLD_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-BoldItalic.ttf"),
        // [SOURCE_SANS_SEMIBOLD]: require("../assets/fonts/source-sans/SourceSansPro-SemiBold.ttf"),
        // [SOURCE_SANS_SEMIBOLD_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-SemiBoldItalic.ttf"),
        // [SOURCE_SANS_REGULAR]: require("../assets/fonts/source-sans/SourceSansPro-Regular.ttf"),
        // [SOURCE_SANS_REGULAR_ITALIC]: require("../assets/fonts/source-sans/SourceSansPro-Italic.ttf"),

        // RUBIK
        // [RUBIK_BLACK]: require("../assets/fonts/rubik/Rubik-Black.ttf"),
        // [RUBIK_BLACK_ITALIC]: require("../assets/fonts/rubik/Rubik-BlackItalic.ttf"),
        // [RUBIK_BOLD]: require("../assets/fonts/rubik/Rubik-Bold.ttf"),
        // [RUBIK_BOLD_ITALIC]: require("../assets/fonts/rubik/Rubik-BoldItalic.ttf"),
        // [RUBIK_SEMIBOLD]: require("../assets/fonts/rubik/Rubik-Medium.ttf"),
        // [RUBIK_SEMIBOLD_ITALIC]: require("../assets/fonts/rubik/Rubik-MediumItalic.ttf"),
        // [RUBIK_REGULAR]: require("../assets/fonts/rubik/Rubik-Regular.ttf"),
        // [RUBIK_REGULAR_ITALIC]: require("../assets/fonts/rubik/Rubik-Italic.ttf"),

        // NUNITO
        // [NUNITO_BLACK]: require("../assets/fonts/nunito/Nunito-Black.ttf"),
        // [NUNITO_BLACK_ITALIC]: require("../assets/fonts/nunito/Nunito-BlackItalic.ttf"),
        // [NUNITO_BOLD]: require("../assets/fonts/nunito/Nunito-Bold.ttf"),
        // [NUNITO_BOLD_ITALIC]: require("../assets/fonts/nunito/Nunito-BoldItalic.ttf"),
        // [NUNITO_SEMIBOLD]: require("../assets/fonts/nunito/Nunito-SemiBold.ttf"),
        // [NUNITO_SEMIBOLD_ITALIC]: require("../assets/fonts/nunito/Nunito-SemiBoldItalic.ttf"),
        // [NUNITO_REGULAR]: require("../assets/fonts/nunito/Nunito-Regular.ttf"),
        // [NUNITO_REGULAR_ITALIC]: require("../assets/fonts/nunito/Nunito-Italic.ttf"),

        // CAROS
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
