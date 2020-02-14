import React, { useCallback, useContext, useRef, useMemo } from "react";
import {
  Heading,
  OverlineText,
  SubHeading
} from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { signOut } from "../../auth/store/effects";
import { Button, Animated, Alert } from "react-native";
import { NavigationContext, SectionList } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectSelectedHouseholdName
} from "../../households/store/state";
import {
  createPlantForHousehold,
  deletePlantByHouseholdId
} from "../../plants/store/effects";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { HouseholdPlantsSubscription } from "../../plants/subscriptions/household-plants";
import {
  selectPlantsTimelineByHouseholdIdGroupedByCareDueDate,
  TimelineSection,
  PlantTimelineItem
} from "../../plants/store/state";
import { useStore } from "../../../store/state";
import {
  HouseholdsSelection,
  COLLAPSED_MIN_HEIGHT
} from "../../households/components/households-selection";
import styled from "styled-components/native";
import { faPlus } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { CurrentProfileAvatar } from "../../profiles/components/current-profile-button";
import { IErr } from "../../../utils/err";
import { createCareForPlantByCurrentProfileId } from "../../care/store/effects";
import { HouseholdCaresSubscription } from "../../care/subscriptions/household-cares";
import { symbols, useTheme } from "../../../theme";
import { BottomSheet, BottomSheetRef } from "../../../components/bottom-sheet";

export const Home = () => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <HomeScreen />;
  }

  return <SplashScreen />;
};

const HomeScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const sections = useStore(
    () =>
      pipe(
        selectedHouseholdId_,
        O.map(selectPlantsTimelineByHouseholdIdGroupedByCareDueDate),
        O.getOrElse(() => [] as TimelineSection[])
      ),
    [selectedHouseholdId_]
  );

  const handleCreatePlant = useCallback(async () => {
    const task = pipe(
      selectedHouseholdId_,
      TE.fromOption(() => "NOT_FOUND" as IErr),
      TE.chain(
        createPlantForHousehold({
          careRecurrenceDays: (Math.random() * (14 - 0 + 1)) << 0
        })
      )
    );
    task();
  }, [selectedHouseholdId_]);

  const handleDeletePlant = useCallback(async (plant: PlantTimelineItem) => {
    try {
      await new Promise((resolve, reject) =>
        Alert.alert(
          "Remove plant",
          `Are you sure you want to remove ${plant.name}?`,
          [
            {
              text: "Cancel",
              onPress: reject
            },
            {
              text: `I'm sure`,
              onPress: resolve
            }
          ]
        )
      );
      await deletePlantByHouseholdId(plant.householdId)(plant.id)();
    } catch (err) {}
  }, []);

  const handleCareForPlant = useCallback(async (plant: PlantTimelineItem) => {
    createCareForPlantByCurrentProfileId(plant.id)(plant.householdId)();
  }, []);

  const scrollAnimatedValue = useRef(new Animated.Value(0));

  return (
    <ScreenLayout>
      <AppHeading scrollAnimatedValue={scrollAnimatedValue.current} />
      {selectedHouseholdId ? (
        <>
          <HouseholdPlantsSubscription householdId={selectedHouseholdId} />
          <HouseholdCaresSubscription householdId={selectedHouseholdId} />
        </>
      ) : null}
      <SectionList
        ListHeaderComponent={
          <HouseholdsSelection
            scrollAnimatedValue={scrollAnimatedValue.current}
          />
        }
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { y: scrollAnimatedValue.current } } }
        ])}
        sections={sections}
        keyExtractor={plant => plant.id}
        renderSectionHeader={item => (
          <TimelineSectionHeader>
            <OverlineText>{item.section.title}</OverlineText>
          </TimelineSectionHeader>
        )}
        renderItem={({ item }) => (
          <TimelinePlantItem
            onLongPress={() => handleDeletePlant(item)}
            onPress={() => handleCareForPlant(item)}
          >
            <Heading>{item.name}</Heading>
          </TimelinePlantItem>
        )}
        ListFooterComponent={
          <Button title="Add plant" onPress={handleCreatePlant} />
        }
      />
    </ScreenLayout>
  );
};

const TimelineSectionHeader = styled.View`
  background-color: ${props => props.theme.appBackground};
  padding-top: ${symbols.spacing._16};
  padding-bottom: ${symbols.spacing._8};
  margin-horizontal: ${symbols.spacing._18};
`;

const TimelinePlantItem = styled.TouchableOpacity`
  background-color: ${props => props.theme.timelinePlantItemBackground};
  padding-vertical: ${symbols.spacing._12};
  padding-horizontal: ${symbols.spacing._16};
  border-radius: 6;
  margin-bottom: ${symbols.spacing._8};
  margin-horizontal: ${symbols.spacing._18};
`;

const AppHeading = ({
  scrollAnimatedValue
}: {
  scrollAnimatedValue: Animated.Value;
}) => {
  const selectedHouseholdName_ = useStore(selectSelectedHouseholdName);
  const selectedHouseholdName = pipe(
    selectedHouseholdName_,
    O.getOrElse(() => "")
  );

  const opacity = useMemo(
    () =>
      scrollAnimatedValue.interpolate({
        inputRange: [0, COLLAPSED_MIN_HEIGHT],
        outputRange: [0, 1],
        extrapolate: "clamp"
      }),
    [scrollAnimatedValue]
  );

  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const handleShowBottomSheet = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand(1);
    }
  }, [bottomSheetRef.current]);

  return (
    <>
      <HeadingWrapper>
        <CurrentProfileAvatar onPress={signOut} />
        <HouseholdNameTitle style={{ opacity }}>
          <SubHeading>{selectedHouseholdName}</SubHeading>
        </HouseholdNameTitle>
        <AddButton onPress={handleShowBottomSheet} />
      </HeadingWrapper>
      <BottomSheet
        intermediateSnapPointHeight={200}
        header={<Heading style={{ color: "black" }}>Add new</Heading>}
        ref={bottomSheetRef}
      >
        <Button title="Household" onPress={console.log} />
        <Button title="Plant" onPress={console.log} />
      </BottomSheet>
    </>
  );
};

const HouseholdNameTitle = styled(Animated.Text)``;

const HeadingWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AddButton = ({ onPress }: { onPress: () => void }) => {
  const theme = useTheme();
  return (
    <AddButtonButton onPress={onPress}>
      <AddIconWrapper>
        <FontAwesomeIcon color={theme.addNewIcon} icon={faPlus} size={20} />
      </AddIconWrapper>
    </AddButtonButton>
  );
};

const AddButtonButton = styled.TouchableOpacity`
  padding-vertical: ${symbols.spacing._16};
  padding-horizontal: ${symbols.spacing._16};
  justify-content: center;
  align-items: center;
`;

const AddIconWrapper = styled.View`
  width: ${symbols.size.avatarSmall};
  height: ${symbols.size.avatarSmall};
  justify-content: center;
  align-items: center;
`;

const SplashScreen = () => {
  const { navigate } = useContext(NavigationContext);

  const handleSignUp = useCallback(() => {
    navigate(createSignUpRoute());
  }, []);

  const handleSignIn = useCallback(() => {
    navigate(createLoginRoute());
  }, []);

  return (
    <ScreenLayout>
      <Heading>Plantpal</Heading>
      <Button title="Create account" onPress={handleSignUp} />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};
