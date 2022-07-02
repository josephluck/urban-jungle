import { TouchableOpacity } from "@urban-jungle/design/components/touchable-opacity";
import { symbols } from "@urban-jungle/design/theme";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useCallback } from "react";
import { View } from "react-native";
import { deletePlantPhoto } from "../../../store/effects";
import { selectPhotosForPlant } from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { PlantImage } from "./plant-image";
import { PlantImageUploader } from "./plant-image-uploader";

export const PlantImageHeader = ({
  plantId,
  householdId,
}: {
  plantId: string;
  householdId: string;
}) => {
  const runWithUIState = useRunWithUIState();
  const photo = useStore(
    () => selectPhotosForPlant(householdId, plantId),
    [householdId, plantId],
  );

  const handleDeletePhoto = useCallback(
    (photoId: string) =>
      runWithUIState(deletePlantPhoto(householdId, plantId)(photoId)),
    [householdId, plantId],
  );

  return (
    <View style={{ paddingHorizontal: symbols.spacing.appHorizontal }}>
      {pipe(
        photo,
        O.fold(
          () => (
            <PlantImageUploader householdId={householdId} plantId={plantId} />
          ),
          (photo) => (
            <TouchableOpacity onLongPress={() => handleDeletePhoto(photo.id)}>
              <PlantImage uri={photo.uri} />
            </TouchableOpacity>
          ),
        ),
      )}
    </View>
  );
};
