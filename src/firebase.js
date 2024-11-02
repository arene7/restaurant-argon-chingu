// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

import { getFirestore } from "firebase/firestore";
import { getAuth, collection } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5cgkutrbbRFYisgAsGAorpIDAC7kN35k",
  authDomain: "chingu-restaurant-app.firebaseapp.com",
  projectId: "chingu-restaurant-app",
  storageBucket: "chingu-restaurant-app.appspot.com",
  messagingSenderId: "658636166903",
  appId: "1:658636166903:web:0ed5d6e69bfeb8b68da5f2",
  measurementId: "G-DD9TGHKHZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection };