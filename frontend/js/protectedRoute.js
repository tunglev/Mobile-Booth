import { auth } from "./firebaseConfig.js";

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});