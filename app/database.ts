import { database as makeDatabase } from "@urban-jungle/shared/database/database";
import { decode, encode } from "base-64";
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import { env } from "./env";

const app = firebase.initializeApp(env.firebase);

export const database = makeDatabase(firestore(app));

// @ts-ignore
if (!global.btoa) {
  // @ts-ignore
  global.btoa = encode;
}

// @ts-ignore
if (!global.atob) {
  // @ts-ignore
  global.atob = decode;
}
