import { ImageModel } from "@urban-jungle/shared/models/image";

export type Context = {
  authenticationFlow: "splash" | "signUp" | "signIn";
  authType: "phone" | "email";
  phoneNumber?: string;
  verificationId?: string;
  verificationCode?: string;
  emailAddress?: string;
  password?: string;
  name?: string;
  avatar?: ImageModel;
  skipAvatar: boolean;
  isAuthenticated: boolean;
  skipEmailAddress: boolean;
};

export type AdditionalEntryData = {
  routeName: string;
};
