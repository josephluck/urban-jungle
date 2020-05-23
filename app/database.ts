import { database as makeDatabase } from "@urban-jungle/shared/database/database";
import { decode, encode } from "base-64";
import firebase from "firebase";
import "firebase/firestore";
import { env } from "./env";

firebase.initializeApp(env.firebase);

export const database = makeDatabase(firebase.firestore());

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
