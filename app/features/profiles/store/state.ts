import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { Appearance } from "react-native-appearance";

import { getFirstLetterFromOptionString } from "@urban-jungle/shared/fp/option";
import {
  ProfileModel,
  ThemeSetting,
} from "@urban-jungle/shared/models/profile";

import { store } from "../../../store/state";
import { selectCurrentUserId } from "../../auth/store/state";

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
    O.map((p) => p.email),
  );

export const selectCurrentProfileAvatar = (): O.Option<string> =>
  pipe(
    selectCurrentProfile(),
    O.filterMap((p) => O.fromNullable(p.avatar)),
  );

export const selectCurrentProfileThemeSetting = (): ThemeSetting =>
  pipe(
    selectCurrentProfile(),
    O.filterMap((p) => O.fromNullable(p.theme)),
    O.getOrElse(() => "system" as ThemeSetting),
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

export const selectProfileAvatarById = (id: string): O.Option<string> =>
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
  id: string;
  name: O.Option<string>;
  letter: O.Option<string>;
  avatar: O.Option<string>;
}

export const selectMiniProfileById = (id: string): MiniProfile => {
  const name = selectProfileNameById(id);
  return {
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

export const upsertProfile = store.createMutator((s, profile: ProfileModel) => {
  s.profiles.profiles[profile.id] = profile;
});

export const setProfileTheme = store.createMutator(
  (s, profileId: string, theme: ThemeSetting) => {
    s.profiles.profiles[profileId].theme = theme;
  },
);

export const upsertProfiles = store.createMutator(
  (s, profiles: ProfileModel[]) => {
    profiles.forEach((profile) => {
      s.profiles.profiles[profile.id] = profile;
    });
  },
);

export const deleteProfiles = store.createMutator((s, profileIds: string[]) => {
  profileIds.forEach((id) => {
    delete s.profiles.profiles[id];
  });
});
