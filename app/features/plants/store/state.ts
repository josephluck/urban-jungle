import { PlantModel } from "../../../types";
import { normalizeArrayById } from "../../../utils/normalize";
import { store } from "../../../store/state";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { selectNumberOfDaysUntilNextCareByHouseholdIdAndPlantId } from "../../care/store/state";

export const selectNormalizedPlantsByHouseholdId = store.createSelector(
  (s, householdId: string): O.Option<Record<string, PlantModel>> =>
    O.fromNullable(s.plants.plantsByHouseholdId[householdId])
);

export const selectPlantsByHouseholdId = (householdId: string): PlantModel[] =>
  pipe(
    selectNormalizedPlantsByHouseholdId(householdId),
    O.map(Object.values),
    O.getOrElse(() => [] as PlantModel[])
  );

export const selectPlantIdsByHouseholdId = (householdId: string): string[] =>
  pipe(
    selectNormalizedPlantsByHouseholdId(householdId),
    O.map(Object.keys),
    O.getOrElse(() => [] as string[])
  );

export const selectPlantByHouseholdAndId = (householdId: string) => (
  plantId: string
): O.Option<PlantModel> =>
  pipe(
    selectNormalizedPlantsByHouseholdId(householdId),
    O.chain((plants) => O.fromNullable(plants[plantId]))
  );

export interface PlantTimelineItem {
  id: string;
  householdId: string;
  name: string;
  nextCareDueInDays: number;
}

export const selectPlantTimelineItem = (householdId: string) => (
  plantId: string
): O.Option<PlantTimelineItem> =>
  pipe(
    selectPlantByHouseholdAndId(householdId)(plantId),
    O.map((plant) => {
      return {
        id: plant.id,
        householdId,
        name: plant.name,
        nextCareDueInDays: selectNumberOfDaysUntilNextCareByHouseholdIdAndPlantId(
          householdId
        )(plantId)(plant.careRecurrenceDays),
      };
    })
  );

export const selectPlantsTimelineByHouseholdId = (
  householdId: string
): PlantTimelineItem[] =>
  selectPlantIdsByHouseholdId(householdId)
    .map(selectPlantTimelineItem(householdId))
    .filter(O.isSome)
    .map(
      O.fold(
        () => (void null as unknown) as PlantTimelineItem,
        (val) => val
      )
    );

const careGroupingsByNextCareDueDate = [
  { min: 0, max: 1, title: "Due today" },
  { min: 1, max: 2, title: "Due tomorrow" },
  { min: 2, max: 8, title: "Due soon" },
  { min: 8, max: 9999, title: "Due later" },
];

export interface TimelineSection {
  title: string;
  // NB: needs to be data for SectionList
  data: PlantTimelineItem[];
}

export const selectPlantsTimelineByHouseholdIdGroupedByCareDueDate = (
  householdId: string
): TimelineSection[] => {
  const plants = selectPlantsTimelineByHouseholdId(householdId);
  return careGroupingsByNextCareDueDate
    .map((group) => ({
      title: group.title,
      data: plants.filter(
        (plant) =>
          plant.nextCareDueInDays >= group.min &&
          plant.nextCareDueInDays < group.max
      ),
    }))
    .filter((group) => group.data.length > 0);
};

export const setPlants = store.createMutator(
  (s, householdId: string, plants: PlantModel[]) => {
    s.plants.plantsByHouseholdId[householdId] = {
      ...s.plants.plantsByHouseholdId[householdId],
      ...normalizeArrayById(plants),
    };
  }
);

export const upsertPlant = store.createMutator(
  (s, householdId: string, plant: PlantModel) => {
    if (!s.plants.plantsByHouseholdId[householdId]) {
      s.plants.plantsByHouseholdId[householdId] = {};
    }
    s.plants.plantsByHouseholdId[householdId][plant.id] = plant;
  }
);

export const deletePlant = store.createMutator(
  (s, householdId: string, plantId: string) => {
    delete s.plants.plantsByHouseholdId[householdId][plantId];
  }
);

export const upsertPlantByHouseholdId = (householdId: string) => (
  plant: PlantModel
) => upsertPlant(householdId, plant);

export const deletePlantbyHouseholdId = (householdId: string) => (
  plantId: string
) => deletePlant(householdId, plantId);
