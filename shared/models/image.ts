import { cleanObj } from "./base";

export interface ImageModel {
  /**
   * The downloadable URI.
   */
  uri: string;
  /**
   * Width in pixels
   */
  width: number;
  /**
   * Height in pixels
   */
  height: number;
  /**
   * NB: this should NEVER be stored in firebase, but can be present during the
   * lifecycle of an image in the app
   */
  base64?: string;
}

export const makeImageModel = (
  model: Partial<ImageModel> = {}
): ImageModel => ({
  uri: "",
  width: 0,
  height: 0,
  ...cleanObj(model),
});
