import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const households = functions.https.onRequest(
  async (_request, response) => {
    const query = await admin.firestore().collection("households").get();
    const data = query.docs.map((doc) => doc.data());
    response.send({ data });
  }
);
