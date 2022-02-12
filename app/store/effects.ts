import { sequenceSTE } from "@urban-jungle/shared/fp/task-either";
import { BaseModel } from "@urban-jungle/shared/models/base";
import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { ImageModel } from "@urban-jungle/shared/models/image";
import { makePhotoModel, PhotoModel } from "@urban-jungle/shared/models/photo";
import { makePlantModel, PlantModel } from "@urban-jungle/shared/models/plant";
import {
  makeProfileModel,
  ProfileModel,
  ThemeSetting,
} from "@urban-jungle/shared/models/profile";
import { makeTodoModel, TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { AsyncStorage, Share } from "react-native";
import { v4 as uuid } from "uuid";
import { trimBase64FromImage } from "../components/camera";
import { database } from "../database";
import { env } from "../env";
import { SignUpContext as SignUpContext } from "../features/auth/machine/types";
import { IdentificationResult } from "../features/identify/types";
import { ManageAuthContext } from "../features/manage/machine/types";
import {
  getAndParseInitialHouseholdInvitationDeepLink,
  makeHouseholdInvitationDeepLink,
} from "../linking/household-invitation";
import { sentryLogin, sentryLogout } from "../sentry";
import {
  selectAuthProviderEmail,
  selectAuthProviderPhone,
  selectAuthUser,
  selectCurrentProfileEmail,
  selectCurrentUserId,
  selectHouseholdById,
  selectPlantByHouseholdId,
  selectProfileById,
  selectProfiles,
  selectTodoByHouseholdId,
  selectTodosByHouseholdIdAndPlantId,
  setProfileTheme,
  setSelectedHouseholdId,
  THEME_SETTING_ASYNC_STORAGE_KEY,
  upsertProfile,
} from "./selectors";
import { store } from "./state";

const authenticateWithEmailAndPassword = (email: string, password: string) =>
  pipe(
    TE.tryCatch(
      async () => firebase.auth().signInWithEmailAndPassword(email, password),
      () => "UNAUTHENTICATED" as IErr,
    ),
  );

const authenticateWithPassword = (password: string) =>
  pipe(
    selectCurrentProfileEmail(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((currentEmail) =>
      authenticateWithEmailAndPassword(currentEmail, password),
    ),
  );

const authenticateWithPhone = (
  verificationId: string,
  verificationCode: string,
) =>
  pipe(
    TE.tryCatch(
      () =>
        firebase
          .auth()
          .signInWithCredential(
            firebase.auth.PhoneAuthProvider.credential(
              verificationId,
              verificationCode,
            ),
          ),
      () => "UNAUTHENTICATED" as IErr,
    ),
  );

export const signInWithEmail = (
  email: string,
  password: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    authenticateWithEmailAndPassword(email, password),
    TE.chain((profile) => fetchProfileIfNotFetched(profile.user?.uid!)),
    TE.map((profile) => profile.id),
  );

export const signInWithPhone = (
  verificationId: string,
  verificationCode: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    authenticateWithPhone(verificationId, verificationCode),
    TE.chain((profile) => fetchProfileIfNotFetched(profile.user?.uid!)),
    TE.map((profile) => profile.id),
  );

export const signUpWithEmail = (
  email: string,
  password: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      () => firebase.auth().createUserWithEmailAndPassword(email, password),
      () => "BAD_REQUEST" as IErr,
    ),
    TE.chain(validateSignUp),
  );

export const sendForgottenPasswordEmail = (email: string) =>
  TE.tryCatch(
    () => firebase.auth().sendPasswordResetEmail(email),
    () => "BAD_REQUEST" as IErr,
  );

export const addEmailAndPasswordCredentials = (
  email: string,
  password: string,
) =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chainFirst((user) =>
      TE.tryCatch(
        async () =>
          user.linkWithCredential(
            firebase.auth.EmailAuthProvider.credential(email, password),
          ),
        () => {
          return "BAD_REQUEST" as IErr;
        },
      ),
    ),
    TE.map((user) => user.uid),
    TE.chain(syncAuthUserWithProfile),
  );

export const signUpWithPhone = signInWithPhone;

export const validateSignUp = (
  credentials: firebase.auth.UserCredential,
): TE.TaskEither<IErr, string> =>
  pipe(
    O.fromNullable(credentials.user),
    O.map((user) => user.uid),
    TE.fromOption(() => "BAD_REQUEST"),
  );

export const updateUserPhone = (
  verificationId: string,
  verificationCode: string,
) =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chainFirst((user) =>
      TE.tryCatch(
        async () =>
          user.updatePhoneNumber(
            firebase.auth.PhoneAuthProvider.credential(
              verificationId,
              verificationCode,
            ),
          ),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((user) => user.uid),
    TE.chain(syncAuthUserWithProfile),
  );

export const updateUserEmail = (newEmail: string) =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chainFirst((user) =>
      TE.tryCatch(
        async () => user.updateEmail(newEmail),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((user) => user.uid),
    TE.chain(syncAuthUserWithProfile),
  );

export const updateUserPassword = (
  currentPassword: string,
  newPassword: string,
) =>
  pipe(
    authenticateWithPassword(currentPassword),
    TE.chain((user) =>
      TE.tryCatch(
        async () => user.user!.updatePassword(newPassword),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const handleEndOfManageAuthFlow = ({
  flow,
  newEmailAddress,
  newPassword,
  verificationCode,
  verificationId,
  currentPassword,
}: ManageAuthContext) => {
  switch (flow) {
    case "ADD_EMAIL_AUTH":
      return addEmailAndPasswordCredentials(newEmailAddress!, newPassword!);
    case "ADD_PHONE_AUTH":
      return updateUserPhone(verificationId!, verificationCode!);
    case "CHANGE_EMAIL":
      return updateUserEmail(newEmailAddress!);
    case "CHANGE_PHONE":
      return updateUserPhone(verificationId!, verificationCode!);
    case "CHANGE_PASSWORD":
      return updateUserPassword(currentPassword!, newPassword!);
    default:
      return TE.left("BAD_REQUEST" as IErr);
  }
};

const removeAuthProvider = (provider: O.Option<firebase.UserInfo>) =>
  pipe(
    sequenceSTE({
      providerId: pipe(
        provider,
        O.map((provider) => provider.providerId),
        TE.fromOption(() => "NOT_FOUND" as IErr),
      ),
      user: pipe(
        selectAuthUser(),
        TE.fromOption(() => "UNAUTHENTICATED" as IErr),
      ),
    }),
    TE.chain(({ providerId, user }) =>
      TE.tryCatch(
        async () => user.unlink(providerId),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const removeEmailAuth = () =>
  pipe(selectAuthProviderEmail(), removeAuthProvider);

export const removePhoneAuth = () =>
  pipe(selectAuthProviderPhone(), removeAuthProvider);

/**
 * Handles creating the relationship between the given profile id and the
 * household if there's a household invitation in the user's initial deep link.
 *
 * Returns the householdId
 */
export const handleInitialHouseholdInvitationLink = (
  profileId: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    getAndParseInitialHouseholdInvitationDeepLink(),
    TE.map((params) => params.householdId),
    TE.chainFirst(createProfileHouseholdRelation(profileId)),
    TE.chain(storeSelectedHouseholdIdToStorage), // TODO: the redirection happens before this is fired
  );

export const signOut = store.createEffect(() => {
  firebase.auth().signOut();
  sentryLogout();
});

export const fetchOrCreateProfile = (
  signUpContext: SignUpContext,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    fetchCurrentProfileIfNotFetched(),
    TE.orElse(createAndSeedProfile(signUpContext)),
  );

export const fetchCurrentProfileIfNotFetched = (): TE.TaskEither<
  IErr,
  ProfileModel
> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(fetchProfileIfNotFetched),
  );

export const createAndSeedProfile = (
  signUpContext: SignUpContext,
) => (): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectAuthUser(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createProfileForUser(signUpContext)),
    TE.map((profile) => profile.id),
    // TODO: check initial deep link, and skip creating a household if there's a householdId in the deep link?
    TE.chain(createHouseholdForProfile()),
    TE.chain(fetchCurrentProfileIfNotFetched),
  );

/**
 * Creates a new household. Subsequently adds the current user relation to it.
 */
export const createHouseholdForProfile = (
  household: Partial<
    Omit<HouseholdModel, "id" | "dateCreated">
  > = defaultHousehold,
) => (profileId: string): TE.TaskEither<IErr, HouseholdModel> =>
  pipe(
    TE.right({
      ...defaultHousehold,
      ...household,
      id: uuid(),
      dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
    }),
    TE.chainFirst((household) =>
      TE.tryCatch(
        () => database.households.database.doc(household.id).set(household),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((household) => household.id),
    TE.chainFirst((id) => storeSelectedHouseholdIdToStorage(id)),
    TE.chain(createProfileHouseholdRelation(profileId)),
    TE.chain(fetchHousehold),
  );

export const createHouseholdForCurrentProfile = (
  household: Partial<
    Omit<HouseholdModel, "id" | "dateCreated">
  > = defaultHousehold,
): TE.TaskEither<IErr, HouseholdModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(createHouseholdForProfile(household)),
  );

export const fetchHousehold = (
  id: string,
): TE.TaskEither<IErr, HouseholdModel> =>
  TE.tryCatch(
    async () => {
      const response = await database.households.database.doc(id).get();
      if (!response.exists) {
        throw new Error();
      }
      return (response.data() as unknown) as HouseholdModel;
    },
    () => "NOT_FOUND",
  );

export const addHouseholdToCurrentProfile = (
  householdId: string,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((profileId) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(profileId).update({
            householdIds: firebase.firestore.FieldValue.arrayUnion(householdId),
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chain(fetchCurrentProfileIfNotFetched),
  );

/**
 * Creates the relationship between a profile and a household.
 *
 * Returns the household ID
 */
export const createProfileHouseholdRelation = (profileId: string) => (
  householdId: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.right(householdId),
    TE.chain(addProfileToHousehold(profileId)),
    TE.chain(addHouseholdToCurrentProfile),
    TE.map(() => householdId),
  );

/**
 * Adds the provided profileId to the provided household (by householdId).
 * Returns the householdId.
 */
const addProfileToHousehold = (profileId: string) => (
  householdId: string,
): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      await database.households.database.doc(householdId).update({
        profileIds: firebase.firestore.FieldValue.arrayUnion(profileId),
      });
      return householdId;
    },
    () => "BAD_REQUEST",
  );

export const removeProfileFromHousehold = (profileId: string) => (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    () =>
      database.households.database.doc(householdId).update({
        profileIds: firebase.firestore.FieldValue.arrayRemove(profileId),
      }),
    () => "BAD_REQUEST",
  );

/**
 * Removes a household.
 */
export const removeHousehold = (id: string): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => await database.households.database.doc(id).delete(),
    () => "BAD_REQUEST",
  );

export const shareHouseholdInvitation = (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      const link = makeHouseholdInvitationDeepLink(householdId);
      try {
        const result = await Share.share({
          title: `Can you help me care for my plants?`,
          message: `Hey, I need some help caring for my plants! It's easy to sign up, just tap this link to get started: ${link} `,
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        // TODO: handle
      }
    },
    () => "BAD_REQUEST",
  );

/**
 * Stores and returns the provided household id to AsyncStorage, only if there
 * isn't one already stored.
 * Returns the value stored in AsyncStorage once completed.
 */
export const storeSelectedHouseholdIdToStorageIfNotPresent = (
  id: string,
): TE.TaskEither<IErr, string> => {
  return pipe(
    retrieveSelectedHouseholdIdFromStorage(),
    TE.orElse(() => storeSelectedHouseholdIdToStorage(id)),
  );
};

/**
 * Stores the given household as a preference in async storage, used to select
 * a default household from the list should the user belong to more than one.
 *
 * Returns the household Id
 */
export const storeSelectedHouseholdIdToStorage = (
  id: string,
): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      setSelectedHouseholdId(id);
      await AsyncStorage.setItem(SELECTED_HOUSEHOLD_ID_KEY, id);
      return id;
    },
    () => "BAD_REQUEST",
  );

/**
 * Retrieves the selected household preference from async storage
 */
export const retrieveSelectedHouseholdIdFromStorage = (): TE.TaskEither<
  IErr,
  string
> =>
  TE.tryCatch(
    async () => {
      const id = await AsyncStorage.getItem(SELECTED_HOUSEHOLD_ID_KEY);
      if (!id) {
        throw new Error();
      }
      return id;
    },
    () => "BAD_REQUEST",
  );

/**
 * Used as a key inside AsyncStorage to persist the user's selected household
 * between logins.
 */
export const SELECTED_HOUSEHOLD_ID_KEY = "SELECTED_HOUSEHOLD_ID";

export const defaultHousehold: Omit<HouseholdModel, "id" | "dateCreated"> = {
  name: "My Urban Jungle",
  profileIds: [],
};

export const identifyPlantFromImages = (
  images: ImageInfo[],
): TE.TaskEither<IErr, IdentificationResult> =>
  pipe(
    O.fromNullable(images),
    O.filter((images) => images.every((image) => Boolean(image.base64))),
    O.map((images) => images.map((image) => image.base64 || "")),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((base64Images) => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: env.plantId.apiKey,
        images: base64Images, // NB: base64 images
        modifiers: ["crops_medium", "similar_images"],
        plant_language: "en",
        plant_details: ["common_names", "wiki_description", "synonyms"],
      }),
    })),
    // TODO: this is the real request, but the API is limited to 200 uses. Uncomment this when the implementation is finished.
    TE.chain((request) =>
      TE.tryCatch(
        async () => {
          const response = await fetch(
            "https://api.plant.id/v2/identify",
            request,
          );
          return await response.json();
        },
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    // TODO: this is an example response as the API is limited to 200 uses. Uncomment this when the implementation is finished.
    // TE.chain(() =>
    //   TE.tryCatch(
    //     async () => {
    //       const sleep = (duration: number = 1000) =>
    //         new Promise((resolve) => setTimeout(resolve, duration));
    //       await sleep(1000);
    //       return exampleIdentificationResponse;
    //     },
    //     () => "BAD_REQUEST" as IErr
    //   )
    // )
  );

// TODO: move this as an export in top level state as it's shared?
export type PlantFields = Omit<
  PlantModel,
  keyof BaseModel | "householdId" | "avatar"
> & {
  avatar: ImageModel;
};

export const upsertPlantForHousehold = (
  { avatar, ...fields }: Partial<PlantFields> = {},
  plantId?: string,
) => (householdId: string): TE.TaskEither<IErr, PlantModel> =>
  pipe(
    selectHouseholdById(householdId),
    O.chain(() =>
      plantId
        ? selectPlantByHouseholdId(householdId, plantId)
        : O.fromNullable(makePlantModel()),
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((plant) => ({
      ...plant,
      ...fields,
      householdId,
    })),
    TE.chainFirst((plant) =>
      TE.tryCatch(
        () => database.plants.database(householdId).doc(plant.id).set(plant),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chainFirst((plant) =>
      pipe(
        savePlantImage(householdId, plant.id, O.fromNullable(avatar)),
        TE.orElse(() => TE.right(makePhotoModel())), // Swallow the error if there's no avatar
      ),
    ),
  );

/**
 * Sets a photo in to storage and assigns it to the plant's primary avatar
 * NB: assumes the image is already in firebase storage
 */
export const savePlantImage = (
  householdId: string,
  plantId: string,
  image: O.Option<ImageModel>,
): TE.TaskEither<IErr, PhotoModel> =>
  pipe(
    image,
    O.map(trimBase64FromImage),
    TE.fromOption(() => "BAD_REQUEST" as IErr),
    TE.map((img) =>
      makePhotoModel({
        ...img,
        type: "plant",
        householdId,
        associatedId: plantId,
      }),
    ),
    TE.chainFirst((photo) =>
      TE.tryCatch(
        () => database.photos.database(householdId).doc(photo.id).set(photo),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chainFirst(setPhotoAsPlantAvatar(householdId, plantId)),
  );

export const setPhotoAsPlantAvatar = (householdId: string, plantId: string) => (
  photo: PhotoModel,
): TE.TaskEither<IErr, void> =>
  pipe(
    TE.right(photo),
    TE.map(trimBase64FromImage),
    TE.chain(() =>
      TE.tryCatch(
        () =>
          database.plants
            .database(householdId)
            .doc(plantId)
            .update({ avatar: photo }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

/**
 * Deletes a plant's image from the database.
 *
 * NB: doesn't remove the image from firebase storage.. should probably do that.
 */
export const deletePlantPhoto = (householdId: string, plantId: string) => (
  photoId: string,
): TE.TaskEither<IErr, void> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database.photos.database(householdId).doc(photoId).delete();
      },
      () => "BAD_REQUEST" as IErr,
    ),
    TE.chain(() => {
      return pipe(deletePlantAvatar(householdId, plantId)());
    }),
  );

/**
 * Deletes the avatar property from the plant.
 * NB: does not remove from the plant's photos subcollection, nor does it
 * actually remove the photo from firebase storage
 */
export const deletePlantAvatar = (
  householdId: string,
  plantId: string,
) => (): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () =>
      database.plants
        .database(householdId)
        .doc(plantId)
        .set(
          { avatar: firebase.firestore.FieldValue.delete() },
          { merge: true },
        ),
    () => "BAD_REQUEST" as IErr,
  );

// TODO: delete photos associated with this plant
export const deletePlantByHouseholdId = (householdId: string) => (
  plantId: string,
): TE.TaskEither<IErr, string> =>
  pipe(
    TE.tryCatch(
      async () => {
        await database.plants.database(householdId).doc(plantId).delete();
        return householdId;
      },
      () => "BAD_REQUEST" as IErr,
    ),
    TE.chainFirst(() => deleteTodosByPlant(plantId)(householdId)),
  );

export const createProfileForUser = (signUpContext: SignUpContext) => (
  user: firebase.User,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    TE.right(user),
    TE.map((user) =>
      makeProfileModel({
        id: user.uid,
        email: user.email || signUpContext.emailAddress,
        phoneNumber: user.phoneNumber || signUpContext.phoneNumber,
        name: signUpContext.name,
        avatar: signUpContext.avatar,
      }),
    ),
    TE.chainFirst((profile) =>
      TE.tryCatch(
        () => database.profiles.database.doc(profile.id).set(profile),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const syncAuthUserWithProfile = (userId: string) =>
  pipe(
    sequenceSTE({
      user: pipe(
        selectAuthUser(),
        TE.fromOption(() => "UNAUTHENTICATED" as IErr),
      ),
      profile: fetchProfileIfNotFetched(userId),
    }),
    TE.map(({ profile, user }) =>
      makeProfileModel({
        ...profile,
        email: pipe(O.fromNullable(user.email), O.toUndefined),
        phoneNumber: pipe(O.fromNullable(user.phoneNumber), O.toUndefined),
      }),
    ),
  );

export const fetchProfileIfNotFetched = (
  id: string,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectProfiles(),
    selectProfileById(O.fromNullable(id)),
    TE.fromOption(() => id),
    TE.orElse(fetchProfile),
  );

export const fetchProfile = (id: string): TE.TaskEither<IErr, ProfileModel> =>
  TE.tryCatch(
    async () => {
      const response = await database.profiles.database.doc(id).get();
      if (!response.exists) {
        throw new Error();
      }
      const profile = response.data() as ProfileModel;
      upsertProfile(profile);
      sentryLogin({
        id: profile.id,
        email: profile.email,
      });
      return profile;
    },
    () => "NOT_FOUND" as IErr,
  );

export const updateProfile = (fields: Partial<ProfileModel>) =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain(fetchProfileIfNotFetched),
    TE.chainFirst((profile) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(profile.id).update({
            ...profile,
            ...fields,
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.map((profile) => profile.id),
    TE.chain(fetchProfile),
  );

/**
 * Removes a household from the profile.
 *
 * TODO: when a household is deleted, it will not remove the household ids from
 * all profiles the household. If there are multiple profiles associated with
 * a household, the household should probably not be deleted and only the
 * association between the current user and the household should be removed.
 * At the moment, the household is deleted, but there can still be stray
 * profiles associated to it.
 */
export const removeHouseholdFromProfile = (
  householdId: string,
): TE.TaskEither<IErr, ProfileModel> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(id).update({
            householdIds: firebase.firestore.FieldValue.arrayRemove(
              householdId,
            ),
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chain(fetchCurrentProfileIfNotFetched),
  );

export const saveExpoPushTokenToProfile = (
  pushToken: string,
): TE.TaskEither<IErr, void> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(id).update({
            pushToken,
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const persistThemeSettingOnDevice = (userId: string) => (
  theme: ThemeSetting,
) =>
  pipe(
    TE.tryCatch(
      () => AsyncStorage.setItem(THEME_SETTING_ASYNC_STORAGE_KEY, theme),
      () => "BAD_REQUEST" as IErr,
    ),
    TE.map(() => {
      setProfileTheme(userId, theme);
    }),
  );

export const saveThemeSettingForProfile = (
  theme: ThemeSetting,
): TE.TaskEither<IErr, void> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chainFirst((userId) =>
      TE.tryCatch(
        () =>
          database.profiles.database.doc(userId).update({
            theme,
          }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    TE.chain((userId) => persistThemeSettingOnDevice(userId)(theme)),
  );

export const removeExpoPushTokenFromProfile = (): TE.TaskEither<IErr, void> =>
  pipe(
    selectCurrentUserId(),
    TE.fromOption(() => "UNAUTHENTICATED" as IErr),
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          database.profiles.database
            .doc(id)
            .set(
              { pushToken: firebase.firestore.FieldValue.delete() },
              { merge: true },
            ),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const upsertTodoForPlant = (plantId: string, todoId?: string) => (
  householdId: string,
) => (fields: Partial<TodoModel> = {}): TE.TaskEither<IErr, TodoModel> =>
  pipe(
    selectHouseholdById(householdId),
    O.chain(() =>
      todoId
        ? selectTodoByHouseholdId(householdId, todoId)
        : O.fromNullable(makeTodoModel()),
    ),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((todo) => ({ ...todo, ...fields, plantId, householdId })),
    TE.chainFirst((todo) =>
      TE.tryCatch(
        () =>
          database.todos
            .database(householdId)
            .doc(todo.id)
            .set({
              ...todo,
              activeInMonths: [...todo.activeInMonths].sort((a, b) => a - b),
            }),
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );

export const deleteTodosByPlant = (plantId: string) => (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      const todos = selectTodosByHouseholdIdAndPlantId(householdId, plantId);
      const batch = firebase.firestore().batch();
      todos.forEach((todo) =>
        batch.delete(database.todos.database(householdId).doc(todo.id)),
      );
      await batch.commit();
    },
    () => "BAD_REQUEST" as IErr,
  );

export const deleteTodo = (todoId: string) => (
  householdId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      await database.todos.database(householdId).doc(todoId).delete();
    },
    () => "BAD_REQUEST" as IErr,
  );

export const updateTodoLastDone = (householdId: string, profileId: string) => (
  todoId: string,
): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    () =>
      database.todos
        .database(householdId)
        .doc(todoId)
        .update({
          lastDoneBy: profileId,
          dateLastDone: firebase.firestore.Timestamp.fromDate(new Date()),
        } as Partial<TodoModel>),
    () => "BAD_REQUEST" as IErr,
  );

export const updateTodosLastDone = (householdId: string) => (
  profileId: string,
) => (todos: TodoModel[]) =>
  TE.tryCatch(
    async () => {
      const batch = firebase.firestore().batch();
      todos.forEach(({ id }) =>
        batch.update(database.todos.database(householdId).doc(id), {
          lastDoneBy: profileId,
          dateLastDone: firebase.firestore.Timestamp.fromDate(new Date()),
        } as Partial<TodoModel>),
      );
      await batch.commit();
    },
    () => "BAD_REQUEST" as IErr,
  );
