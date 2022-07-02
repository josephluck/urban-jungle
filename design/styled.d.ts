// import original module declarations
import "styled-components/native";
import { Theme } from "./theme";

declare module "styled-components/native" {
  export interface DefaultTheme extends Theme {}
}
