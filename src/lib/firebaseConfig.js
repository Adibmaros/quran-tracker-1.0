import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, update, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA8FPaWo93IEraOFBru0RBVd_xVGpct1bE",
  authDomain: "exo-mengaji.firebaseapp.com",
  projectId: "exo-mengaji",
  databaseURL: "https://exo-mengaji-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "exo-mengaji.firebasestorage.app",
  messagingSenderId: "908291872962",
  appId: "1:908291872962:web:5dde088672c2f26bb2835b",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, update, get };
