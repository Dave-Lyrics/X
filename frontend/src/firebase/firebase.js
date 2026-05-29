import { initializeApp } from "firebase/app";

import {
	getAuth,
	GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyDAAQw3azQaWY2zrSa_C2DVj8wXVZgWKkY",
	authDomain: "x-clone-aebdb.firebaseapp.com",
	projectId: "x-clone-aebdb",
	storageBucket: "x-clone-aebdb.firebasestorage.app",
	messagingSenderId: "1040138817761",
	appId: "1:1040138817761:web:f02703e0aa01bb199627a0",
    measurementId: "G-ZXD2XP777C",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();