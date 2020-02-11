import { Dimensions, Animated, Easing } from "react-native";
import SideSwipe from "react-native-sideswipe";
import { useStore } from "../../../store/state";
import { selectHouseholds } from "../store/state";
import React, { useState, useCallback, useEffect, useRef } from "react";
import styled from "styled-components/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-light-svg-icons";
import {
  ManageHouseholdMembers,
  MANAGE_HOUSEHOLD_MEMBERS_COLLAPSED_HEIGHT,
  MANAGE_HOUSEHOLD_MEMBERS_EXPANDED_HEIGHT
} from "./manage-household-members";
import { theme } from "../../../theme";
import { Heading } from "../../../components/typography";
import { CurrentProfileHouseholdsSubscription } from "../subscriptions/current-profile-households";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { storeSelectedHouseholdIdToStorage } from "../store/effects";
import { IErr } from "../../../utils/err";

const { width } = Dimensions.get("window");

/** Represents the height of the title bar */
const COLLAPSED_MIN_HEIGHT = theme.font._24.lineHeight;

const SPACE_BETWEEN_TITLE_AND_AVATARS = theme.spacing._16;

/** Represents the height of the title bar + the avatars in view-mode */
const COLLAPSED_MAX_HEIGHT =
  COLLAPSED_MIN_HEIGHT +
  SPACE_BETWEEN_TITLE_AND_AVATARS +
  MANAGE_HOUSEHOLD_MEMBERS_COLLAPSED_HEIGHT;

/** Represents the height of the title bar + the avatars in edit-mode */
const COLLAPSED_MAX_HEIGHT_EDIT_MODE =
  COLLAPSED_MIN_HEIGHT +
  SPACE_BETWEEN_TITLE_AND_AVATARS +
  MANAGE_HOUSEHOLD_MEMBERS_EXPANDED_HEIGHT;

export const HouseholdsSelection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const households = useStore(selectHouseholds);

  const enterExpandedMode = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const exitExpandedMode = useCallback(() => {
    setEditMode(false);
    setIsExpanded(false);
  }, []);

  const enterEditMode = useCallback(() => {
    enterExpandedMode();
    setEditMode(true);
  }, [enterExpandedMode]);

  const exitEditMode = useCallback(() => {
    setEditMode(false);
  }, [exitExpandedMode]);

  const handleSlideIndexChange = useCallback(
    async (index: number) => {
      setSlideIndex(index);
      const task = pipe(
        O.fromNullable(households[index]),
        O.map(household => household.id),
        TE.fromOption(() => "NOT_FOUND" as IErr),
        TE.chain(storeSelectedHouseholdIdToStorage)
      );
      await task();
    },
    [households]
  );

  const isExpandedAnimation = useRef(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(isExpandedAnimation.current, {
      toValue: isExpanded ? 100 : 0,
      duration: 180,
      easing: Easing.inOut(Easing.cubic)
    }).start();
  }, [isExpanded]);

  const collapseHeightAnimation = useRef(
    new Animated.Value(COLLAPSED_MIN_HEIGHT)
  );
  useEffect(() => {
    Animated.timing(collapseHeightAnimation.current, {
      toValue:
        isExpanded && editMode
          ? COLLAPSED_MAX_HEIGHT_EDIT_MODE
          : isExpanded
          ? COLLAPSED_MAX_HEIGHT
          : COLLAPSED_MIN_HEIGHT,
      duration: 180,
      easing: Easing.inOut(Easing.cubic)
    }).start();
  }, [isExpanded, editMode]);

  return (
    <>
      <CurrentProfileHouseholdsSubscription />
      <Wrapper>
        <CollapsableView
          style={{
            height: collapseHeightAnimation.current
          }}
        >
          <SideSwipe
            index={slideIndex}
            itemWidth={width}
            style={{ width }}
            data={households}
            onIndexChange={handleSlideIndexChange}
            extractKey={item => item.id}
            renderItem={slide => (
              <HouseholdItemWrapper
                onLongPress={enterEditMode}
                onPress={enterExpandedMode}
              >
                <Heading>{slide.item.name}</Heading>
                <CollapsedInner
                  style={{
                    opacity: isExpandedAnimation.current.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, 1]
                    })
                  }}
                >
                  <ManageHouseholdMembers
                    householdId={slide.item.id}
                    editMode={editMode}
                    onCancelPress={exitEditMode}
                  />
                </CollapsedInner>
              </HouseholdItemWrapper>
            )}
          />
        </CollapsableView>
        <ExpandButton
          onPress={isExpanded ? exitExpandedMode : enterExpandedMode}
        >
          <FontAwesomeIcon
            color={theme.colors.pureWhite}
            icon={isExpanded ? faChevronUp : faChevronDown}
          />
        </ExpandButton>
      </Wrapper>
    </>
  );
};

const Wrapper = styled.View`
  align-items: center;
  justify-content: center;
`;

const CollapsableView = styled(Animated.View)``;

const CollapsedInner = styled(Animated.View)`
  margin-top: ${SPACE_BETWEEN_TITLE_AND_AVATARS}px;
`;

const ExpandButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  padding-vertical: ${props => props.theme.spacing._12}px;
  width: 100%;
`;

const HouseholdItemWrapper = styled.TouchableOpacity`
  align-items: center;
  width: ${width}px;
`;
