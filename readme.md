# Plantpal

Collect and care for your plants with friends.

---

# Set up

## Dependencies

Plantpal is set up as a Yarn Monorepo. Install dependencies at the root:

```
yarn
```

## Stack

- Typescript
- Expo & React Native
- Styled Components
- Firebase Auth
- Firebase Firestore
- Firebase Cloud Functions
- Expo Push Notifications
- Firebase FCM Push Notifications
- Stately
- Reactotron
- Jest
- Sentry

---

# Features

## Plants

Add, manage and categorise plants you own.

## Care

View care instructions and be reminded when care is needed. Manage care with push notifications and todos.

## Household

Add others to your Household to manage caring together. No double watering!

---

# Architecture

This section outlines the core architecture to support Plantpal's features.

## Users & Authentication

Users are required to sign up to Plantpal before they are able to use the application. Firebase Auth is used for this, using the JavaScript SDK. Initially the application uses Username & Password based authentication, but later will use 3rd party sign in such as Google and Facebook. The ultimate goal is to use passwordless authentication via SMS or Email, however Expo does not currently support it.

## Household

When a User signs up, they are automatically seeded with an initial Household. Each Household acts as a category for plants. Users can belong to more than one Household, but usually will only be a member of one.

Households are primarily used as a mechanic for sharing Care (to avoid double care), however Households may be useful as a public showcase of a User's plant collection at some point in the future.

A Household stores a list of User IDs that belong to the Household, as well as Plants and other metadata. The screen in the app lets the User see which Plants are in the Household, as well as any other User's associated with the Household.

If the User only belongs to a single Household, then the User doesn't see a list of the Households they belong to and see the individual Household instead.

Households can be deleted (with double authentication) which removes all of the Household's associated Plants.

## Inviting a User to a Household

A User can be invited to join a Household. This can happen one of two ways depending on whether a User has signed up or not.

If the User has already signed up, when they are invited to join a Household they receive both a push notification and an e-mail with an Invitation to join the Household. The User can choose to Accept or Ignore the Invitation. If the User Accepts the invitation, then they can see the Household in their list of Households.

## Plants

Each Household has a list of Plants that belong to the Household. Plants can be viewed, created, updated and deleted within the context of a Household (and therefore is associated with the Household). When a user creates a Plant, they are prompted to enter Care information, as well as an optional Location which helps to group Plants together. Plants can be rearranged within Locations which orders the Plants in the Care workflow.

## Care notifications

The crux of Plantpal's notification system revolves around a combination of Firebase Firestore, Firebase Cloud Functions and Expo Push Notifications.

Each day, a Cloud Function is triggered which grabs each Household from the database. For each User attached to the Household, a push notification is triggered to remind the User of any Care that needs to be done. A push notification is only triggered if there are plants to Care for that day, and will be skipped otherwise.

It might be possible for a user to configure at which time of the day they wish to receive Care notifications, however initially the notifications will be sent at a predetermined time in the evening.

## Care workflow

The application shows if there are any Care responsibilities due. The User can tap on a Care session to enter the Care workflow, or the User can enter the application via the push notification to enter the Care workflow directly.

Once the User is in the Care workflow, they are presented with a series of screens that represent each Plant that needs Care. The User is told what Care to give to each Plant in the Household, and the User can tick off each Plant once the Care for that plant has been given.
