
import { initializeApp } from "firebase/app";

import {
getAuth,
GoogleAuthProvider
} from "firebase/auth";

import {
getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-tTL2Zq7i2TZmVEuJRyTee2bg6GmQENY",
  authDomain: "health-guard-33bdb.firebaseapp.com",
  projectId: "health-guard-33bdb",
  storageBucket: "health-guard-33bdb.firebasestorage.app",
  messagingSenderId: "113515210582",
  appId: "1:113515210582:web:d906de4d2f7db3f49e18f7",
  measurementId: "G-98W9N1WXFR"
};

const app=initializeApp(firebaseConfig);

export const auth=getAuth(app);

export const provider=new GoogleAuthProvider();

export const db=getFirestore(app);