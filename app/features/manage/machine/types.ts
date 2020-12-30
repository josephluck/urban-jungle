export type ManageAuthFlow =
  | "ADD_EMAIL_AUTH"
  | "ADD_PHONE_AUTH"
  | "CHANGE_PHONE"
  | "CHANGE_EMAIL"
  | "CHANGE_PASSWORD";

export const getScreenTitle = (flow?: ManageAuthFlow) => {
  switch (flow) {
    case "ADD_EMAIL_AUTH":
      return "Add email address";
    case "ADD_PHONE_AUTH":
      return "Add phone number";
    case "CHANGE_PHONE":
      return "Change phone number";
    case "CHANGE_EMAIL":
      return "Change email address";
    case "CHANGE_PASSWORD":
      return "Change password";
    default:
      return "";
  }
};

export type AuthProvider = "EMAIL" | "PHONE";

export type ManageAuthContext = {
  flow?: ManageAuthFlow;
  recentlyAuthenticated: boolean;
  currentPhoneNumber?: string;
  newPhoneNumber?: string;
  currentEmailAddress?: string;
  newEmailAddress?: string;
  currentPassword?: string;
  newPassword?: string;
  verificationId?: string;
  verificationCode?: string;
  currentAuthProviders: AuthProvider[];
  selectedAuthSecurityCheckProvider?: AuthProvider;
};

export type AdditionalEntryData = {
  routeName: string;
};
