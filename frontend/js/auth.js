import { auth } from "./firebaseConfig.js";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

export async function login() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User logged in:", user);
    sessionStorage.setItem("authToken", await user.getIdToken());
    window.location.href = "home.html";
  } catch (error) {
    console.error("Login failed:", error);
  }
}

export async function logout() {
  try {
    await signOut(auth);
    sessionStorage.removeItem("authToken");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
}