import { State } from "@josephluck/machi/src/machine";
import { routeNames } from "../route-names";
import { AdditionalEntryData, ManageAuthContext } from "./types";

export const conditions = {
  isAddEmailFlow: (ctx: ManageAuthContext) => ctx.flow === "ADD_EMAIL_AUTH",
  isAddPhoneAuth: (ctx: ManageAuthContext) => ctx.flow === "ADD_PHONE_AUTH",
  isChangePhone: (ctx: ManageAuthContext) => ctx.flow === "CHANGE_PHONE",
  isChangeEmail: (ctx: ManageAuthContext) => ctx.flow === "CHANGE_EMAIL",
  isChangePassword: (ctx: ManageAuthContext) => ctx.flow === "CHANGE_PASSWORD",
  needsToAuthenticate: (ctx: ManageAuthContext) => !ctx.recentlyAuthenticated,
  hasProvidedCurrentEmailAddress: (ctx: ManageAuthContext) =>
    !!ctx.currentEmailAddress,
  hasProvidedCurrentPassword: (ctx: ManageAuthContext) => !!ctx.currentPassword,
  hasProvidedNewEmailAddress: (ctx: ManageAuthContext) => !!ctx.newEmailAddress,
  hasProvidedNewPassword: (ctx: ManageAuthContext) => !!ctx.newPassword,
  hasProvidedCurrentPhoneNumber: (ctx: ManageAuthContext) =>
    !!ctx.currentPhoneNumber,
  hasProvidedNewPhoneNumber: (ctx: ManageAuthContext) => !!ctx.verificationCode,
  hasSentVerificationCode: (ctx: ManageAuthContext) => !!ctx.verificationId,
  hasProvidedVerificationCode: (ctx: ManageAuthContext) =>
    !!ctx.verificationCode,
  hasSelectedVerifyProvider: (ctx: ManageAuthContext) =>
    !!ctx.selectedAuthSecurityCheckProvider,
  hasSelectedPhoneVerifyProvider: (ctx: ManageAuthContext) =>
    ctx.selectedAuthSecurityCheckProvider === "PHONE",
  hasSelectedEmailVerifyProvider: (ctx: ManageAuthContext) =>
    ctx.selectedAuthSecurityCheckProvider === "EMAIL",
};

export const states: State<
  ManageAuthContext,
  typeof conditions,
  AdditionalEntryData
>[] = [
  {
    id: "Choose verify provider",
    isDone: ["hasSelectedVerifyProvider"],
    routeName: routeNames.manageAuthVerifyProviderRoute,
  },
  {
    fork: "Needs to authenticate?",
    requirements: ["needsToAuthenticate"],
    states: [
      {
        fork: "Which verify provider?",
        requirements: ["hasSelectedPhoneVerifyProvider"],
        states: [
          {
            id: "Verify - Phone number",
            isDone: [
              "hasProvidedCurrentPhoneNumber",
              "hasSentVerificationCode",
            ],
            routeName: routeNames.manageAuthPhoneRoute,
          },
          {
            id: "Verify - Phone verification code",
            isDone: ["hasProvidedVerificationCode"],
            routeName: routeNames.manageAuthPhoneVerifyRoute,
          },
        ],
      },
      {
        fork: "Which verify provider?",
        requirements: ["hasSelectedEmailVerifyProvider"],
        states: [
          {
            id: "Verify - Current email address",
            isDone: ["hasProvidedCurrentEmailAddress"],
            routeName: routeNames.manageAuthEmailRoute,
          },
          {
            id: "Verify - Current password",
            isDone: ["hasProvidedCurrentPassword"],
            routeName: routeNames.manageAuthPasswordRoute,
          },
        ],
      },
    ],
  },
  {
    fork: "Which flow?",
    requirements: ["isAddEmailFlow"],
    states: [
      {
        id: "Add email - New email address",
        isDone: ["hasProvidedNewEmailAddress"],
        routeName: routeNames.manageAuthEmailRoute,
      },
      {
        id: "Add email - New password",
        isDone: ["hasProvidedNewPassword"],
        routeName: routeNames.manageAuthPasswordRoute,
      },
    ],
  },
  {
    fork: "Which flow?",
    requirements: ["isAddPhoneAuth"],
    states: [
      {
        id: "Add phone - New phone number",
        isDone: ["hasProvidedNewPhoneNumber", "hasSentVerificationCode"],
        routeName: routeNames.manageAuthPhoneRoute,
      },
      {
        id: "Add phone - Phone verification code",
        isDone: ["hasProvidedVerificationCode"],
        routeName: routeNames.manageAuthPhoneVerifyRoute,
      },
    ],
  },
  {
    fork: "Which flow?",
    requirements: ["isChangeEmail"],
    states: [
      {
        id: "Change email - New email address",
        isDone: ["hasProvidedNewEmailAddress"],
        routeName: routeNames.manageAuthEmailRoute,
      },
    ],
  },
  {
    fork: "Which flow?",
    requirements: ["isChangePassword"],
    states: [
      {
        id: "Change password - New password",
        isDone: ["hasProvidedNewPassword"],
        routeName: routeNames.manageAuthPasswordRoute,
      },
    ],
  },
  {
    fork: "Which flow?",
    requirements: ["isChangePhone"],
    states: [
      {
        id: "Change phone - New phone number",
        isDone: ["hasProvidedNewPhoneNumber"],
        routeName: routeNames.manageAuthPhoneRoute,
      },
      // TODO: might need to verify the new phone number - if this is the case, we'll need to clear out verificationCode & verificationId from ctx when auth is finished
    ],
  },
];
