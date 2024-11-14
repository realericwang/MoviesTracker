import {
    addDoc, collection, deleteDoc, doc, getDocs, setDoc, query, where
} from "firebase/firestore";
import {auth, database} from "./firebaseSetup";

export async function writeToDB(data, collectionName) {
    console.log( database);
    try {
        await addDoc(collection( database, collectionName), data);
    } catch (err) {
        console.log("writ to db", err);
    }
}

/*delete a document from the database*/
export async function deleteFromDB(id, collectionName) {
    try {
        await deleteDoc(doc( database, collectionName, id));
    } catch (err) {
        console.log("delete from", err);
    }
}

export async function deleteAll(collectionName) {
    try {
        const querySnapshot = await getDocs(collection( database, collectionName));
        querySnapshot.forEach((doc) => {
            deleteFromDB(doc.id, collectionName);
        });
    } catch (err) {
        console.log("delete all", err);
    }
}

/*
* updateDoc only updates existing fields. If the field doesn't exist, it won't add it to the document.
*
* In this case, since we're adding a new field that doesn't exist yet in the document,
* we should use setDoc with {merge: true} instead of updateDoc
* */
export async function addWarning(goalId) {
    try {
        const goalRef = doc( database, "goals", goalId);
        await setDoc(goalRef, {
            warning: true,
        }, {merge: true});
        console.log("Warning added successfully");
    } catch (err) {
        console.log("error in add warning", err);
    }
}

export async function getAllDocs(collectionName) {
    try {
        const querySnapshot = await getDocs(collection( database, collectionName));
        let newArray = [];
        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnapshot) => {
                newArray.push(docSnapshot.data());
            });
            console.log("array from readDocs", newArray);
        }
        return newArray;
    } catch (err) {
        console.log(err);
    }
}