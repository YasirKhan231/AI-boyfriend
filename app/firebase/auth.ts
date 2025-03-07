import { signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "./firebaseConfig";

// Sign in with Google and store user data in Firestore
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user already exists in Firestore
    const userRef = doc(db, "users", user.uid); // Reference to the user document
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // If the user doesn't exist, create a new document in the `users` collection
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });

      console.log("New user created in Firestore:", user.uid);
    }

    return user;
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

// Sign out user
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
