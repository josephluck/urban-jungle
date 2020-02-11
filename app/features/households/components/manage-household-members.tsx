import { useStore } from "../../../store/state";
import {
  selectProfilesForHousehold,
  selectHouseholdById
} from "../store/state";
import styled from "styled-components/native";
import { Avatar } from "../../../components/avatar";
import { AvatarButton } from "../../../components/avatar-button";
import React, { useCallback, useRef, useEffect } from "react";
import {
  shareHouseholdInvitation,
  removeProfileFromHousehold
} from "../store/effects";
import { TouchableOpacity, Animated, Easing, Alert } from "react-native";
import { symbols } from "../../../theme";
import { ButtonLink } from "../../../components/button-link";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";

export const ManageHouseholdMembers = ({
  householdId,
  editMode,
  onCancelPress
}: {
  householdId: string;
  editMode: boolean;
  onCancelPress: () => void;
}) => {
  const profiles = useStore(() => selectProfilesForHousehold(householdId), [
    householdId
  ]);

  const handleAddNewHouseholdMember = useCallback(
    () => shareHouseholdInvitation(householdId)(),
    [householdId]
  );

  const confirmRemoveProfileFromHousehold = useCallback(
    (profileId: string) =>
      new Promise((resolve, reject) =>
        pipe(
          O.fromNullable(profiles.find(p => p.id === profileId)),
          O.chain(profile => profile.name),
          O.fold(reject, name => {
            const householdName = pipe(
              selectHouseholdById(householdId),
              O.map(household => household.name),
              O.getOrElse(() => "this household")
            );
            Alert.alert(
              "Remove member",
              `Are you sure you want to remove ${name} from ${householdName}?`,
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
            );
          })
        )
      ),
    [profiles]
  );

  const handleRemoveProfileFromHousehold = useCallback(
    async (id: string) => {
      try {
        await confirmRemoveProfileFromHousehold(id);
        removeProfileFromHousehold(id)(householdId)();
      } catch (err) {}
    },
    [householdId, confirmRemoveProfileFromHousehold]
  );

  const animatedValue = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue.current, {
      toValue: editMode ? 100 : 0,
      duration: 180,
      easing: Easing.inOut(Easing.cubic)
    }).start();
  }, [editMode]);

  /** 0-indexed number of avatars used for calculating offset margins */
  const NUMBER_OF_AVATARS = profiles.length - 1;

  /** The cumulative distance that avatars are spread by */
  const HALF_TOTAL_AVATARS_SPREAD = NUMBER_OF_AVATARS * (AVATAR_SPREAD / 2);

  return (
    <Wrapper>
      <AvatarsWrapper
        style={{
          transform: [
            {
              translateX: animatedValue.current.interpolate({
                inputRange: [0, 100],
                outputRange: [
                  HALF_BUTTON_SIZE + HALF_TOTAL_AVATARS_SPREAD,
                  -HALF_TOTAL_AVATARS_SPREAD - HALF_BUTTON_SPREAD
                ]
              })
            }
          ]
        }}
      >
        <AvatarsInnerWrapper>
          {profiles.map(({ avatar, letter, id }, i) => (
            <AvatarWrapper
              key={id}
              style={{
                transform: [
                  {
                    translateX: animatedValue.current.interpolate({
                      inputRange: [0, 100],
                      outputRange: [-i * AVATAR_SPREAD, i * AVATAR_SPREAD]
                    })
                  }
                ],
                zIndex: profiles.length - i
              }}
            >
              <TouchableOpacity
                key={id}
                disabled={!editMode}
                onPress={() => handleRemoveProfileFromHousehold(id)}
              >
                <Avatar letter={letter} src={avatar} />
              </TouchableOpacity>
            </AvatarWrapper>
          ))}
        </AvatarsInnerWrapper>
        <AvatarButtonAnimation
          style={{
            transform: [
              {
                translateX: animatedValue.current.interpolate({
                  inputRange: [0, 100],
                  outputRange: [
                    -symbols.size.avatarDefault - AVATAR_SPREAD,
                    NUMBER_OF_AVATARS * AVATAR_SPREAD + AVATAR_SPREAD
                  ]
                })
              }
            ],
            opacity: animatedValue.current.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1]
            })
          }}
        >
          <AvatarButton
            disabled={!editMode}
            onPress={handleAddNewHouseholdMember}
          />
        </AvatarButtonAnimation>
      </AvatarsWrapper>
      <CancelButtonWrapper
        style={{
          height: animatedValue.current.interpolate({
            inputRange: [0, 100],
            outputRange: [0, CANCEL_BUTTON_WRAPPER_HEIGHT]
          }),
          opacity: animatedValue.current.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 1]
          })
        }}
      >
        <ButtonLink onPress={onCancelPress}>Cancel</ButtonLink>
      </CancelButtonWrapper>
    </Wrapper>
  );
};

/** Distance between avatar items when they are expanded */
const AVATAR_SPREAD = 12;

/** Half the size of the add new member button */
const HALF_BUTTON_SIZE = symbols.size.avatarDefault / 2;

/** Half the spread of the new member button (used to offset the margin to make the unexpanded avatars centered) */
const HALF_BUTTON_SPREAD = AVATAR_SPREAD / 2;

/** The computed height of the cancel button (as it's animated in to view) */
const CANCEL_BUTTON_WRAPPER_HEIGHT =
  symbols.font._16.lineHeight + symbols.spacing._16 * 2;

export const MANAGE_HOUSEHOLD_MEMBERS_COLLAPSED_HEIGHT =
  symbols.size.avatarDefault;
export const MANAGE_HOUSEHOLD_MEMBERS_EXPANDED_HEIGHT =
  MANAGE_HOUSEHOLD_MEMBERS_COLLAPSED_HEIGHT + CANCEL_BUTTON_WRAPPER_HEIGHT;

const Wrapper = styled.View`
  align-items: center;
  justify-content: flex-end;
`;

const AvatarsWrapper = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

// TODO: might not be needed (can be combined with above)
const AvatarsInnerWrapper = styled.View`
  z-index: 5; /* NB: to take it above the add new member button */
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const AvatarWrapper = styled(Animated.View)`
  width: 50;
  height: 50;
`;

const AvatarButtonAnimation = styled(Animated.View)``;

const CancelButtonWrapper = styled(Animated.View)`
  align-items: center;
  justify-content: center;
`;
