import { useStore } from "../../../store/state";
import { selectProfilesForHousehold } from "../store/state";
import styled from "styled-components/native";
import { Avatar } from "../../../components/avatar";
import { AvatarButton } from "../../../components/avatar-button";
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  shareHouseholdInvitation,
  removeProfileFromHousehold
} from "../store/effects";
import { TouchableOpacity, Animated, Easing, Alert } from "react-native";
import { theme } from "../../../theme";
import { ButtonLink } from "../../../components/button-link";

export const ManageHouseholdMembers = ({
  householdId
}: {
  householdId: string;
}) => {
  const [editMode, setEditMode] = useState(false);
  const profiles = useStore(() => selectProfilesForHousehold(householdId));

  const handleAddNewHouseholdMember = useCallback(
    () => shareHouseholdInvitation(householdId)(),
    [householdId]
  );

  const enterEditMode = useCallback(() => {
    setEditMode(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setEditMode(false);
  }, []);

  const handleRemoveProfileFromHousehold = useCallback(
    async (id: string) => {
      try {
        await confirmRemoveProfileFromHousehold(id);
        console.log("Confirmed", { id });
        removeProfileFromHousehold(id)(householdId)();
      } catch (err) {}
    },
    [householdId]
  );

  const confirmRemoveProfileFromHousehold = useCallback(
    (id: string) =>
      new Promise((resolve, reject) => {
        const profile = profiles.find(p => p.id === id);
        if (profile) {
          console.log({ profile });
          Alert.alert(
            "Are you sure?",
            `Please confirm you wish to remove ${profile.name}.`,
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
        }
        reject();
      }),
    [profiles]
  );

  const animatedValue = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue.current, {
      toValue: editMode ? 100 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease)
    }).start();
  }, [editMode]);

  /** 0-indexed number of avatars */
  const NUMBER_OF_AVATARS = profiles.length - 1;

  /** The cumulative distance that avatars are spread by */
  const HALF_TOTAL_AVATARS_SPREAD = NUMBER_OF_AVATARS * (AVATAR_SPREAD / 2);

  return (
    <Wrapper>
      <TouchableOpacity onLongPress={enterEditMode}>
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
          <AvatarButtonAnimation
            style={{
              transform: [
                {
                  translateX: animatedValue.current.interpolate({
                    inputRange: [0, 100],
                    outputRange: [
                      -theme.size.avatarImage - AVATAR_SPREAD,
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
            <AvatarButton onPress={handleAddNewHouseholdMember} />
          </AvatarButtonAnimation>
        </AvatarsWrapper>
      </TouchableOpacity>
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
        <ButtonLink onPress={exitEditMode}>Cancel</ButtonLink>
      </CancelButtonWrapper>
    </Wrapper>
  );
};

/** Distance between avatar items when they are expanded */
const AVATAR_SPREAD = 12;

/** Half the size of the add new member button */
const HALF_BUTTON_SIZE = theme.size.avatarImage / 2;

/** Half the spread of the new member button (used to offset the margin to make the unexpanded avatars centered) */
const HALF_BUTTON_SPREAD = AVATAR_SPREAD / 2;

/** The computed height of the cancel button (as it's animated in to view) */
const CANCEL_BUTTON_WRAPPER_HEIGHT =
  theme.font._16.lineHeight + theme.spacing._16 * 2;

const Wrapper = styled.View`
  align-items: center;
  justify-content: center;
`;

const AvatarsWrapper = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const AvatarWrapper = styled(Animated.View)`
  width: ${props => props.theme.size.avatarImage}px;
  height: ${props => props.theme.size.avatarImage}px;
`;

const AvatarButtonAnimation = styled(Animated.View)``;

const CancelButtonWrapper = styled(Animated.View)`
  align-items: center;
  justify-content: center;
`;
