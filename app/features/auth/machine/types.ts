export type Context = {
  authenticationFlow: "splash" | "signUp" | "signIn";
  authType: "phone" | "email";
  phoneNumber?: string;
  verificationId?: string;
  verificationCode?: string;
  emailAddress?: string;
  password?: string;
  name?: string;
  avatar?: string;
  skipAvatar: boolean;
};

export type AdditionalEntryData = {
  routeName: string;
};
