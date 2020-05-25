import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { store } from "../../../../store/state";
import {
  IdentificationResult,
  IdentificationSuggestion,
} from "../../../identify/types";
import { PlantFields } from "../../store/effects";

export const selectIdentificationResult = store.createSelector(
  (s) => s.newPlantWorkflow.identificationResult
);

export const selectIdentificationSuggestions = (): IdentificationSuggestion[] =>
  pipe(
    selectIdentificationResult(),
    O.map((result) => result.suggestions),
    O.getOrElse(() => [] as IdentificationSuggestion[])
  );

export const setIdentificationResult = store.createMutator(
  (s, result: IdentificationResult) => {
    s.newPlantWorkflow.identificationResult = O.fromNullable(result);
  }
);

export const setIdentificationSuggestion = store.createMutator(
  (s, suggestion: IdentificationSuggestion) => {
    s.newPlantWorkflow.selectedIdentificationSuggestion = O.fromNullable(
      suggestion
    );
  }
);

export const setPlantFields = store.createMutator(
  (s, plant: Partial<PlantFields>) => {
    s.newPlantWorkflow.plant = { ...s.newPlantWorkflow.plant, ...plant };
  }
);
