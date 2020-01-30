import { AsyncStorage } from "react-native";

const SESSION_KEY = "USER_SESSION";

export async function storeSession(session: Partial<Session>) {
  const existingSession = await getSession();
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...existingSession, ...session })
  );
}

export async function removeSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<Session> {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : defaultSession;
}

export interface Session {
  /**
   * Unique for each user
   * See https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AuthenticationResultType.html
   */
  idToken: string;
  /**
   * See https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AuthenticationResultType.html
   */
  accessToken: string;
  /**
   * The length of time that the session token is valid for
   * See https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AuthenticationResultType.html
   */
  expires: number;
  /**
   * See https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AuthenticationResultType.html
   */
  refreshToken: string;
  /**
   * See https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_Credentials.html
   */
  accessKeyId: string;
  /**
   * The time at which the token will session expire
   * See https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_Credentials.html
   * Note that expiration is in seconds (not milliseconds) since epoch
   */
  expiration: number;
  /**
   * The timestamp in ms since the epoch that the session token expires
   * See https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_Credentials.html
   */
  secretKey: string;
  /**
   * See https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_Credentials.html
   */
  sessionToken: string;
  /**
   * The Cognito Federated Identity Pool ID that the user belongs to.
   */
  identityId: string;
}

export const defaultSession: Session = {
  idToken: "",
  accessToken: "",
  expires: 0,
  refreshToken: "",
  accessKeyId: "",
  expiration: 0,
  secretKey: "",
  sessionToken: "",
  identityId: ""
};
