
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ── REPLACE THIS BLOCK WITH YOUR OWN CONFIG ── */
const firebaseConfig = {
  apiKey:            "AIzaSyBoQUsEgTHTJatvMNwhgus2IwDDpnY1X7A",
  authDomain:        "neuronote-c57d3.firebaseapp.com",
  projectId:         "neuronote-c57d3",
  storageBucket:     "neuronote-c57d3.firebasestorage.app",
  messagingSenderId: "19898620078",
  appId:             "1:19898620078:web:6508f21026a00ac3dfb53f"
};
/* ────────────────────────────────────────────── */

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();
const db       = getFirestore(app);

export { auth, provider, db, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };
