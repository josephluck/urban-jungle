import firebase from "firebase";

export const database = () => firebase.firestore().collection("profiles");
