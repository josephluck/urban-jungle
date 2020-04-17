import { env } from "./env";
import firebase from "firebase";
import "firebase/firestore";

firebase.initializeApp(env.firebase);
