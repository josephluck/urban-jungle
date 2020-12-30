import { Condition, State } from "@josephluck/machi/src/machine";
import { routeNames } from "../components/route-names";
import { AdditionalEntryData, Context } from "./types";

type Conditions = Record<string, Condition<Context>>;

export const states: State<Context, Conditions, AdditionalEntryData>[] = [
  {
    id: "Splash",
    routeName: routeNames.splashRoute,
    isDone: [
      function hasChosenSignUpOrSignIn(context) {
        return context.authenticationFlow !== "splash";
      },
    ],
  },
  {
    fork: "Needs to authenticate?",
    requirements: [
      function needsToAuthenticate(context) {
        return !context.isAuthenticated;
      },
    ],
    states: [
      {
        fork: "Which auth type has been chosen?",
        requirements: [
          function phoneAuth(context) {
            return context.authType === "phone";
          },
        ],
        states: [
          {
            id: "Enter phone number",
            routeName: routeNames.signUpPhoneRoute,
            isDone: [
              function phoneNumberEntered(context) {
                return !!context.phoneNumber;
              },
              function otpSent(context) {
                return !!context.verificationId;
              },
            ],
          },
          {
            id: "Verify phone number using OTP",
            routeName: routeNames.signUpPhoneVerifyRoute,
            isDone: [
              function verificationCodeEntered(context) {
                return !!context.verificationCode;
              },
            ],
          },
        ],
      },
      {
        fork: "Which auth type has been chosen?",
        requirements: [
          function emailAuth(context) {
            return context.authType === "email";
          },
        ],
        states: [
          {
            id: "Enter email address",
            routeName: routeNames.signUpEmailRoute,
            isDone: [
              function hasProvidedEmail(context) {
                return !!context.emailAddress;
              },
            ],
          },
          {
            id: "Enter password",
            routeName: routeNames.signUpPasswordRoute,
            isDone: [
              function hasProvidedOrResetPassword(context) {
                return !!context.password || context.hasResetPassword;
              },
            ],
          },
          {
            fork: "Has reset password",
            requirements: [
              function hasResetPassword(context) {
                return context.hasResetPassword;
              },
            ],
            states: [
              {
                id: "Reset password instructions",
                routeName: routeNames.resetPasswordInstructions,
                isDone: [
                  function hasSeenResetPasswordInstructions(context) {
                    return context.hasSeenResetPasswordInstructions;
                  },
                ],
              },
              {
                id: "Reset password enter new password",
                routeName: routeNames.resetPasswordEnterNewPassword,
                isDone: [
                  function hasProvidedPassword(context) {
                    return !!context.password;
                  },
                  function hasSuccessfullyResetPassword(context) {
                    return context.isAuthenticated;
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "Enter name",
    routeName: routeNames.signUpNameRoute,
    isDone: [
      function hasProvidedName(context) {
        return !!context.name;
      },
    ],
  },
  // {
  //   id: "Capture avatar",
  //   routeName: routeNames.signUpAvatarRoute,
  //   isDone: [
  //     function hasProvidedOrSkippedAvatar(context) {
  //       return !!context.avatar || context.skipAvatar;
  //     },
  //   ],
  // },
];
