import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, database } from "./firebaseSetup";

/**
 * A set of utility functions for interacting with Firestore database.
 * Provides functions for writing, deleting, reading (all documents and by query), and updating documents.  Handles errors and returns appropriate data.
 *
 * @module firebaseDBHelpers
 */

export async function writeToDB(data, collectionName) {
  console.log(database);
  try {
    await addDoc(collection(database, collectionName), data);
  } catch (err) {
    console.log("writ to db", err);
  }
}

/*delete a document from the database*/
export async function deleteFromDB(id, collectionName) {
  try {
    await deleteDoc(doc(database, collectionName, id));
  } catch (err) {
    console.log("delete from", err);
  }
}

export async function getAllDocs(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(database, collectionName));
    let newArray = [];
    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnapshot) => {
        newArray.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      // console.log("array from readDocs", newArray);
    }
    return newArray;
  } catch (err) {
    console.log(err);
  }
}

export async function getDocsByQueries(
  collectionName,
  conditions,
  single = false
) {
  try {
    const colRef = collection(database, collectionName);
    const q = query(colRef, ...conditions);
    const querySnapshot = await getDocs(q);

    if (single) {
      // Return a single document
      let docData = null;
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        docData = { id: docSnapshot.id, ...docSnapshot.data() };
      }
      return docData;
    } else {
      // Return an array of documents
      let results = [];
      querySnapshot.forEach((docSnapshot) => {
        results.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      return results;
    }
  } catch (err) {
    console.log("get docs by queries", err);
    return []; // Return an empty array or rethrow the error
  }
}

export async function updateDocInDB(id, data, collectionName) {
  try {
    const docRef = doc(database, collectionName, id);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.log("update doc in db", err);
  }
}

/**
 * Fetches bookmarked movies for the currently authenticated user
 * @returns {Promise<Array>} Array of bookmarked movies with their details
 */
export async function fetchBookmarkedMovies(user) {
  if (!user) {
    return [];
  }
  try {
    const bookmarksData = await getDocsByQueries("bookmarks", [
      where("userId", "==", user.uid),
    ]);
    return bookmarksData;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw new Error("Failed to load bookmarks. Please try again.");
  }
}
