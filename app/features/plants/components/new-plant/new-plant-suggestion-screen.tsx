import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { CircleImage } from "../../../../components/circle-image";
import { BackableScreenLayout } from "../../../../components/layouts/backable-screen";
import { BodyText, ScreenTitle } from "../../../../components/typography";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { useStore } from "../../../../store/state";
import { symbols } from "../../../../theme";
import { IdentificationSuggestion } from "../../../identify/types";
import { newPlantNicknameRoute } from "./new-plant-nickname-screen";
import {
  selectIdentificationSuggestions,
  setIdentificationSuggestion,
  setPlantFields,
} from "./state";

export const NewPlantSuggestionScreen = ({
  navigation,
}: StackScreenProps<{}>) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<
    O.Option<IdentificationSuggestion>
  >(O.none);

  const suggestions = useStore(selectIdentificationSuggestions);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleSubmit = useCallback(
    () =>
      pipe(
        selectedSuggestion,
        O.map((suggestion) => {
          setPlantFields({ name: suggestion.plant_name });
          setIdentificationSuggestion(suggestion);
          newPlantNicknameRoute.navigateTo(navigation, {});
        })
      ),
    [selectedSuggestion]
  );
  const handleSkip = useCallback(
    () => newPlantNicknameRoute.navigateTo(navigation, {}),
    []
  );

  // TODO: support progress bar
  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      scrollView={false}
      progress={40}
      footer={
        <Footer>
          <SkipButton type="plain" onPress={handleSkip}>
            Skip
          </SkipButton>
          <Button
            large
            disabled={pipe(selectedSuggestion, O.isNone)}
            onPress={handleSubmit}
          >
            Next
          </Button>
        </Footer>
      }
    >
      <FlatList
        ListHeaderComponent={<ScreenTitle title="Which is yours?" />}
        style={{
          paddingHorizontal: symbols.spacing.appHorizontal,
          paddingVertical: symbols.spacing._20,
          flex: 1,
        }}
        data={suggestions}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const isSelected = pipe(
            selectedSuggestion,
            O.filter((suggestion) => suggestion.id === item.id),
            O.isSome
          );
          return (
            <SuggestionButton
              onPress={() => setSelectedSuggestion(O.some(item))}
            >
              <SuggestionImage
                size={100}
                uri={pipe(
                  O.fromNullable(item.similar_images[0]),
                  O.map((image) => image.url),
                  O.getOrElse(() => "")
                )}
                withTickBadge={isSelected}
              />
              <SuggestionName weight="semibold">
                {pipe(
                  O.fromNullable(item.plant_details),
                  O.filterMap((details) =>
                    O.fromNullable(details.common_names)
                  ),
                  O.filterMap((names) => O.fromNullable(names[0])),
                  O.getOrElse(() => item.plant_name)
                )}
              </SuggestionName>
            </SuggestionButton>
          );
        }}
      />
    </BackableScreenLayout>
  );
};

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

const SuggestionButton = styled(TouchableOpacity)`
  flex: 1;
  margin-bottom: ${symbols.spacing._32};
  margin-horizontal: ${symbols.spacing._16};
  align-items: center;
`;

const SuggestionImage = styled(CircleImage)`
  margin-bottom: ${symbols.spacing._8};
`;

const SuggestionName = styled(BodyText)`
  text-align: center;
  max-width: 160;
`;

export const newPlantSuggestionRoute = makeNavigationRoute({
  screen: NewPlantSuggestionScreen,
  routeName: "NEW_PLANT_SUGGESTION_SCREEN",
});
