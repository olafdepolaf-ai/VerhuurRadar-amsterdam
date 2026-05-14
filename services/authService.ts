import { signInWithPopup, signOut, deleteUser, User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";


export const loginWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during sign-out:", error);
        throw error;
    }
};

export const deleteCurrentUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        try {
            await deleteUser(user);
        } catch (error) {
            console.error("Error deleting user account:", error);
            throw error;
        }
    } else {
        throw new Error("No user is currently signed in to delete.");
    }
};
