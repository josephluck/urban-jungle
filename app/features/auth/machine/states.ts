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
              function hasProvidedPassword(context) {
                return !!context.password;
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
  {
    fork: "Needs to capture e-mail",
    requirements: [
      function hasntProvidedEmailYet(context) {
        return typeof context.emailAddress === "undefined";
      },
    ],
    states: [
      {
        id: "Capture email address",
        routeName: routeNames.signUpCaptureEmailRoute,
        isDone: [
          function hasProvidedOrSkippedEmail(context) {
            return !!context.emailAddress || !context.skipEmailAddress;
          },
        ],
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
