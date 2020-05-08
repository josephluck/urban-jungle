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
}

export const makeImageModel = (
  model: Partial<ImageModel> = {}
): ImageModel => ({
  uri: "",
  width: 0,
  height: 0,
  ...model,
});
