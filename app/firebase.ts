import { env } from "./env";
import firebase from "firebase";
import "firebase/firestore";

import { decode, encode } from "base-64";

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

firebase.initializeApp(env.firebase);
