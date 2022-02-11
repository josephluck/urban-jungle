import { getFirstLetterFromOptionString } from "@urban-jungle/shared/fp/option";
import { ImageModel } from "@urban-jungle/shared/models/image";
import {
  ProfileModel,
  ThemeSetting,
} from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { AsyncStorage } from "react-native";
import { Appearance } from "react-native-appearance";
import { store } from "../../../store/state";
import { selectCurrentUserId } from "../../auth/store/state";
import { persistThemeSettingOnDevice } from "./effects";

/**
 * SELECTORS
 */

export const selectProfiles = store.createSelector(
  (s): Record<string, ProfileModel> => s.profiles.profiles,
);

export const selectCurrentProfile = store.createSelector(
  (s): O.Option<ProfileModel> =>
    pipe(s.profiles.profiles, selectProfileById(selectCurrentUserId())),
);

export const selectCurrentProfileEmail = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.filterMap((p) => O.fromNullable(p.email)),
  );

export const selectCurrentProfilePhone = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.filterMap((p) => O.fromNullable(p.phoneNumber)),
  );

export const selectCurrentProfileAvatar = (): O.Option<ImageModel> =>
  pipe(
    selectCurrentProfile(),
    O.filterMap((p) => O.fromNullable(p.avatar)),
  );

export const THEME_SETTING_ASYNC_STORAGE_KEY = "theme-setting";

export const hydrateThemeSetting = () =>
  pipe(
    TE.tryCatch(
      () => AsyncStorage.getItem(THEME_SETTING_ASYNC_STORAGE_KEY),
      () => "NOT_FOUND" as IErr,
    ),
    TE.filterOrElse(
      (value) => !!value,
      () => "NOT_FOUND" as IErr,
    ),
    TE.map((value) => setTheme(value as ThemeSetting)),
  )();

export const selectThemeLoading = store.createSelector(
  (state) => state.profiles.themeLoading,
);

export const selectTheme = store.createSelector(
  (state) => state.profiles.theme,
);

export const selectCurrentProfileThemeSetting = (): ThemeSetting =>
  pipe(
    selectCurrentProfile(),
    O.filterMap((p) => O.fromNullable(p.theme)),
    O.getOrElse(selectTheme),
  );

export const getThemeFromDevicePreference = (): ThemeSetting => {
  switch (Appearance.getColorScheme()) {
    case "dark":
      return "dark";
    default:
      return "light";
  }
};

export const selectCurrentProfileThemeIsDark = (): boolean =>
  pipe(
    selectCurrentProfileThemeSetting(),
    (theme) => (theme === "system" ? getThemeFromDevicePreference() : theme),
    (theme) => theme === "dark",
  );

export const selectCurrentProfileName = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.map((p) => p.name),
  );

export const selectPushNotificationsEnabled = (): boolean =>
  pipe(
    selectCurrentProfile(),
    O.filter((profile) => Boolean(profile.pushToken)),
    O.fold(
      () => false,
      () => true,
    ),
  );

export const selectProfileById = (id: O.Option<string>) => (
  profiles: Record<string, ProfileModel>,
): O.Option<ProfileModel> =>
  pipe(
    id,
    O.map((i) => O.fromNullable(profiles[i])),
    O.flatten,
  );

export const selectProfileById2 = (id: string): O.Option<ProfileModel> =>
  O.fromNullable(selectProfiles()[id]);

export const selectProfileAvatarById = (id: string): O.Option<ImageModel> =>
  pipe(
    selectProfileById2(id),
    O.chain((profile) => O.fromNullable(profile.avatar)),
  );

export const selectProfileNameById = (id: string): O.Option<string> =>
  pipe(
    selectProfileById2(id),
    O.map((profile) => profile.name),
  );

export interface MiniProfile {
  isCurrentProfile: boolean;
  id: string;
  name: O.Option<string>;
  letter: O.Option<string>;
  avatar: O.Option<ImageModel>;
}

export const selectMiniProfileById = (id: string): MiniProfile => {
  const name = selectProfileNameById(id);
  return {
    isCurrentProfile: pipe(
      selectCurrentUserId(),
      O.filter((currId) => currId === id),
      O.isSome,
    ),
    id,
    name,
    letter: pipe(name, O.map(getFirstLetterFromOptionString), O.flatten),
    avatar: selectProfileAvatarById(id),
  };
};

export const selectCurrentMiniProfile = (): MiniProfile =>
  pipe(
    selectCurrentUserId(),
    O.map(selectMiniProfileById),
    O.getOrElse(
      () =>
        ({
          isCurrentProfile: false,
          id: "",
          avatar: O.none,
          letter: O.none,
          name: O.none,
        } as MiniProfile),
    ),
  );

/**
 * MUTATORS
 */

export const setTheme = store.createMutator((s, theme?: ThemeSetting) => {
  if (theme) {
    s.profiles.theme = theme;
  }
  s.profiles.themeLoading = false;
});

export const upsertProfile = store.createMutator((s, profile: ProfileModel) => {
  s.profiles.profiles[profile.id] = profile;
});

export const setProfileTheme = store.createMutator(
  (s, profileId: string, theme: ThemeSetting) => {
    s.profiles.theme = theme;
    s.profiles.profiles[profileId].theme = theme;
  },
);

export const upsertProfiles = store.createMutator(
  (s, profiles: ProfileModel[]) => {
    profiles.forEach((profile) => {
      s.profiles.profiles[profile.id] = profile;
      pipe(
        s.auth.authUser,
        O.filterMap((user) =>
          pipe(
            O.fromNullable(profile),
            O.filter((profile) => profile.email === user.email),
          ),
        ),
        O.map((profile) => {
          persistThemeSettingOnDevice(profile.id)(profile.theme || "system");
          setProfileTheme(profile.id, profile.theme || "system");
        }),
      );
    });
  },
);

export const deleteProfiles = store.createMutator((s, profileIds: string[]) => {
  profileIds.forEach((id) => {
    delete s.profiles.profiles[id];
  });
});
