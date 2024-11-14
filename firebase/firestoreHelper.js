import {
    addDoc, collection, deleteDoc, doc, getDocs, setDoc, query, where
} from "firebase/firestore";
import {auth, database} from "./firebaseSetup";

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
                newArray.push(docSnapshot.data());
            });
            console.log("array from readDocs", newArray);
        }
        return newArray;
    } catch (err) {
        console.log(err);
    }
}

export async function getDocsByQueries(collectionName, conditions, single = false) {
    try {
        const colRef = collection(database, collectionName);
        const q = query(colRef, ...conditions);
        const querySnapshot = await getDocs(q);

        if (single) {
            // Return a single document
            let docData = null;
            if (!querySnapshot.empty) {
                const docSnapshot = querySnapshot.docs[0];
                docData = {id: docSnapshot.id, ...docSnapshot.data()};
            }
            return docData;
        } else {
            // Return an array of documents
            let results = [];
            querySnapshot.forEach((docSnapshot) => {
                results.push({id: docSnapshot.id, ...docSnapshot.data()});
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
        await setDoc(docRef, data, {merge: true});
    } catch (err) {
        console.log("update doc in db", err);
    }
}
