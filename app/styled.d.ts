// import original module declarations
import "styled-components/native";
import { Theme } from "../design/theme";

declare module "styled-components/native" {
  export interface DefaultTheme extends Theme {}
}
