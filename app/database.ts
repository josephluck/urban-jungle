import { database as makeDatabase } from "@urban-jungle/shared/database/database";
import firebase from "firebase";

export const database = makeDatabase(firebase.firestore());
