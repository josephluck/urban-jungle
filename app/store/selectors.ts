import {
  getFirstLetterFromOptionString,
  sequenceSO,
  sequenceTO,
} from "@urban-jungle/shared/fp/option";
import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { ImageModel } from "@urban-jungle/shared/models/image";
import { PhotoModel } from "@urban-jungle/shared/models/photo";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import {
  ProfileModel,
  ThemeSetting,
} from "@urban-jungle/shared/models/profile";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import { normalizeArrayById } from "@urban-jungle/shared/utils/normalize";
import firebase from "firebase";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { Appearance } from "react-native-appearance";
import {
  AuthProvider,
  ManageAuthContext,
} from "../features/manage/machine/types";
import { normalizedStateFactory } from "./factory";
import { store } from "./state";

/**
 * SELECTORS
 */

export const selectInitializing = store.createSelector(
  (s): boolean => s.auth.initializing,
);

export const selectAuthUser = store.createSelector(
  (s): O.Option<firebase.User> => s.auth.authUser,
);

export const selectIsLoggedIn = () => O.isSome(selectAuthUser());

export const selectCurrentUserId = (): O.Option<string> =>
  pipe(
    selectAuthUser(),
    O.map((u) => u.uid),
  );

export const selectProfileById = (id: O.Option<string>) => (
  profiles: Record<string, ProfileModel>,
): O.Option<ProfileModel> =>
  pipe(
    id,
    O.map((i) => O.fromNullable(profiles[i])),
    O.flatten,
  );

export const selectCurrentProfile = store.createSelector(
  (s): O.Option<ProfileModel> =>
    pipe(s.profiles.profiles, selectProfileById(selectCurrentUserId())),
);

export const selectHasAuthenticated = (): boolean =>
  pipe(sequenceTO(selectAuthUser(), selectCurrentProfile()), O.isSome);

export const selectAuthProviders = () =>
  pipe(
    selectAuthUser(),
    O.map((user) => user.providerData),
  );

export const selectAuthProviderPhone = () =>
  pipe(
    selectAuthProviders(),
    O.filterMap((providers) =>
      O.fromNullable(providers.find((p) => p?.providerId === "phone")),
    ),
  );

export const selectAuthProviderEmail = () =>
  pipe(
    selectAuthProviders(),
    O.filterMap((providers) =>
      O.fromNullable(providers.find((p) => p?.providerId === "password")),
    ),
  );

export const selectHasMultipleAuthProviders = () =>
  pipe(
    selectAuthProviders(),
    O.map((providers) => providers.filter(Boolean)),
    O.filter((providers) => providers.length > 0),
    O.isSome,
  );

const selectAuthProvidersForMachine = (): O.Option<AuthProvider[]> => {
  const authProviderEmail = selectAuthProviderEmail();
  const authProviderPhone = selectAuthProviderPhone();

  if (O.isSome(authProviderEmail) && O.isSome(authProviderPhone)) {
    return O.some(["EMAIL", "PHONE"]);
  }

  if (O.isSome(authProviderPhone)) {
    return O.some(["PHONE"]);
  }

  if (O.isSome(authProviderEmail)) {
    return O.some(["EMAIL"]);
  }

  return O.none;
};

export const selectManageAuthInitialContext = (): Partial<ManageAuthContext> =>
  pipe(
    sequenceSO({
      profile: selectCurrentProfile(),
      authProviders: selectAuthProvidersForMachine(),
    }),
    O.map(
      ({ profile, authProviders }): Partial<ManageAuthContext> => ({
        currentEmailAddress: profile.email,
        currentPhoneNumber: profile.phoneNumber,
        currentAuthProviders: authProviders,
      }),
    ),
    O.getOrElse(() => ({})),
  );

/**
 * MUTATORS
 */

export const setUser = store.createMutator(
  (s, authUser: O.Option<firebase.User>) => {
    s.auth.authUser = authUser;
  },
);

export const setInitializing = store.createMutator(
  (s, initializing: boolean) => {
    s.auth.initializing = initializing;
  },
);

export const selectHouseholds = store.createSelector((s) =>
  Object.values(s.households.households),
);

export const selectSelectedHouseholdId = store.createSelector(
  (s) => s.households.selectedHouseholdId,
);

export const selectHouseholdById = (id: string): O.Option<HouseholdModel> =>
  O.fromNullable(selectHouseholds().find((household) => household.id === id));

export const selectedSelectedOrMostRecentHouseholdId = (): O.Option<string> =>
  pipe(
    selectSelectedHouseholdId(),
    O.filter((id) => Boolean(selectHouseholdById(id))),
    O.fold(selectMostRecentlyAddedHouseholdId, O.some),
  );

/**
 * Gets the user's selected preferred household, or the most recent one if there
 * isn't a preference.
 */
export const selectSelectedHousehold = (): O.Option<HouseholdModel> =>
  pipe(selectedSelectedOrMostRecentHouseholdId(), O.chain(selectHouseholdById));

export const selectSelectedHouseholdName = (): O.Option<string> =>
  pipe(
    selectSelectedHousehold(),
    O.map((household) => household.name),
  );

/**
 * Returns the most recently added household from the list of households.
 */
export const selectMostRecentlyAddedHousehold = (): O.Option<HouseholdModel> =>
  pipe(
    selectHouseholds(),
    O.fromPredicate((households) => households.length > 0),
    O.map((households) =>
      households.sort(
        (a, b) =>
          a.dateCreated.toDate().getTime() - b.dateCreated.toDate().getTime(),
      ),
    ),
    O.map((households) => O.fromNullable(households[0])),
    O.flatten,
  );

export const selectMostRecentlyAddedHouseholdId = (): O.Option<string> =>
  pipe(
    selectMostRecentlyAddedHousehold(),
    O.map((household) => household.id),
  );

/**
 * Returns a list of unique profileIds for all households in the state.
 */
export const selectProfileIdsForHouseholds = (): string[] => {
  const profileIds = selectHouseholds()
    .map((household) => household.profileIds)
    .reduce((acc, arr) => [...acc, ...arr], []);
  return [...new Set(profileIds)];
};

export const selectProfileIdsForHousehold = (id: string): O.Option<string[]> =>
  pipe(
    selectHouseholdById(id),
    O.map((household) => household.profileIds),
  );

export const selectProfileNamesForHousehold = (
  id: string,
): O.Option<string>[] =>
  pipe(
    selectProfileIdsForHousehold(id),
    O.map((profileIds) => profileIds.map(selectProfileNameById)),
    O.fold(
      () => [],
      (val) => val,
    ),
  );

export const selectProfilesForHousehold = (id: string): MiniProfile[] =>
  pipe(
    selectProfileIdsForHousehold(id),
    O.getOrElse(() => [] as string[]),
  )
    .map(selectMiniProfileById)
    .sort((a) => (a.isCurrentProfile ? 1 : -1));

export const setHouseholds = store.createMutator(
  (s, households: HouseholdModel[]) => {
    s.households.households = {
      ...s.households.households,
      ...normalizeArrayById(households),
    };
  },
);

export const setSelectedHouseholdId = store.createMutator((s, id: string) => {
  s.households.selectedHouseholdId = O.fromNullable(id);
});

export const upsertHousehold = store.createMutator(
  (s, household: HouseholdModel) => {
    s.households.households[household.id] = household;
  },
);

export const deleteHousehold = store.createMutator((s, householdId: string) => {
  delete s.households.households[householdId];
});

const photoMethods = normalizedStateFactory<PhotoModel>("photos");

export const selectNormalizedPhotosByHouseholdId =
  photoMethods.selectNormalized;
export const selectPhotosByHouseholdId = photoMethods.selectMany;
export const selectPhotoIdsByHouseholdId = photoMethods.selectManyIds;
export const selectPhotoByHouseholdId = photoMethods.select;
export const selectPhotosByIds = photoMethods.selectManyByIds;

export const upsertPhoto = photoMethods.upsert;
export const upsertPhotos = photoMethods.upsertMany;
export const removePhoto = photoMethods.remove;
export const removePhotos = photoMethods.removeMany;

export const selectPhotosForPlant = (
  householdId: string,
  plantId: string,
): O.Option<PhotoModel> =>
  pipe(
    O.fromNullable(
      selectPhotosByHouseholdId(householdId).filter(
        (photo) => photo.associatedId === plantId,
      )[0],
    ),
    O.filter((photo) => Boolean(photo.uri)),
  );

const plantsMethods = normalizedStateFactory<PlantModel>("plants");

export const selectNormalizedPlantsByHouseholdId =
  plantsMethods.selectNormalized;
export const selectPlantsByHouseholdId = plantsMethods.selectMany;
export const selectPlantIdsByHouseholdId = plantsMethods.selectManyIds;
export const selectPlantByHouseholdId = plantsMethods.select;
export const selectPlantsByIds = plantsMethods.selectManyByIds;

export const upsertPlant = plantsMethods.upsert;
export const upsertPlants = plantsMethods.upsertMany;
export const removePlant = plantsMethods.remove;
export const removePlants = plantsMethods.removeMany;

export const selectUniqueLocations = (householdId: string): string[] => [
  ...new Set(
    selectPlantsByHouseholdId(householdId)
      .map((plant) => plant.location)
      .filter(Boolean) as string[],
  ),
];

export const isPlantAvatarThisPhoto = (
  householdId: string,
  plantId: string,
) => (photoId: string) =>
  pipe(
    selectPlantByHouseholdId(householdId, plantId),
    O.chain((plant) => O.fromNullable(plant.avatar)),
    O.fold(
      () => false,
      (photo) => photo.id === photoId,
    ),
  );

export const getPlantName = (plant: PlantModel) =>
  plant.nickname || plant.name || "";

export type PlantsGroup = {
  data: PlantModel[];
  title: string;
};

export const groupPlantsByLocation = () => {
  const groups: PlantsGroup[] = [];
  return (plants: PlantModel[]) => {
    plants.forEach((plant) => {
      const existingGroup = groups.find(
        (group) => group.title === plant.location,
      );
      if (existingGroup) {
        existingGroup.data.push(plant);
      } else {
        groups.push({
          title: plant.location || "Other",
          data: [plant],
        });
      }
    });

    return groups.sort((a, b) => a.title.localeCompare(b.title));
  };
};

/**
 * SELECTORS
 */

export const selectProfiles = store.createSelector(
  (s): Record<string, ProfileModel> => s.profiles.profiles,
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
      () => {
        setTheme();
        return "NOT_FOUND" as IErr;
      },
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

const methods = normalizedStateFactory<TodoModel>("todos");

export const selectNormalizedTodosByHouseholdId = methods.selectNormalized;
export const selectTodosByHouseholdId = methods.selectMany;
export const selectTodoByHouseholdId = methods.select;
export const selectTodosByIds = methods.selectManyByIds;

export const upsertTodo = methods.upsert;
export const upsertTodos = methods.upsertMany;
export const removeTodo = methods.remove;
export const removeTodos = methods.removeMany;

export const selectTodosByHouseholdIdAndPlantId = (
  householdId: string,
  plantId: string,
): TodoModel[] =>
  selectTodosByHouseholdId(householdId).filter(
    (todo) => todo.plantId === plantId,
  );

/**
 * Returns the date that the todo is due for. If it's overdue,
 * it'll return today. If it's never been done, it'll also return today.
 * TODO: no need for the wrapping fn
 */
export const selectTodoNextDue = (todo: TodoModel): moment.Moment =>
  pipe(
    O.fromNullable(todo.dateLastDone),
    O.map((lastDone) =>
      moment(lastDone.toDate()).add(
        todo.recurrenceCount,
        todo.recurrenceInterval,
      ),
    ),
    O.filter((dueDate) => dueDate.isSameOrAfter(moment(), "day")),
    O.getOrElse(() => moment()),
  );

export const selectDueTodos = (householdId: string) => () =>
  selectTodosByHouseholdId(householdId)
    .map((todo) => ({
      ...todo,
      nextDue: selectTodoNextDue(todo),
    }))
    .filter((todo) => moment(todo.nextDue).isSame(moment(), "date"))
    .map((todo) => todo.id);

export const selectTodosForPlant = (plantId: string) => (
  householdId: string,
): TodoModel[] =>
  selectTodosByHouseholdId(householdId).filter(
    (todo) => todo.plantId === plantId,
  );

export type TodoWithPlantModel = TodoModel & {
  plant: O.Option<PlantModel>;
};

export const selectTodosAndPlantsByIds = (householdId: string) => (
  todoIds: string[],
): TodoWithPlantModel[] =>
  selectTodosByIds(householdId, todoIds)
    .map((todo) => ({
      ...todo,
      plant: selectPlantByHouseholdId(householdId, todo.plantId),
    }))
    .filter((todo) => O.isSome(todo.plant));

export const sortTodosByLocationAndPlant = (
  { plant: plantA }: TodoWithPlantModel,
  { plant: plantB }: TodoWithPlantModel,
): number =>
  pipe(
    sequenceTO(plantA, plantB),
    O.fold(
      () => -1,
      ([
        { id: idA, name: nameA, location: locationA = "" },
        { id: idB, name: nameB, location: locationB = "" },
      ]) =>
        locationA.localeCompare(locationB) ||
        nameA.localeCompare(nameB) ||
        idA.localeCompare(idB),
    ),
  );

export type TodosGroup = {
  data: TodoWithPlantModel[];
  title: string;
};

// TODO: this could be a reduce...
export const groupTodosByType = () => {
  const groups: TodosGroup[] = [];
  return (todos: TodoWithPlantModel[]) => {
    todos.forEach((todo) => {
      const existingGroup = groups.find((group) => group.title === todo.title);
      if (existingGroup) {
        existingGroup.data.push(todo);
      } else {
        groups.push({
          title: todo.title,
          data: [todo],
        });
      }
    });

    return groups
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((group) => ({
        ...group,
        data: group.data.sort(sortTodosByLocationAndPlant),
      }));
  };
};

export const selectUniqueTodoTitles = (householdId: string): string[] => [
  ...new Set(
    selectTodosByHouseholdId(householdId)
      .map((todo) => todo.title)
      .filter(Boolean) as string[],
  ),
];
