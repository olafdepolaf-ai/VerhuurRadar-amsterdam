import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query } from "firebase/firestore";
import { db } from "./firebase";
import { SavedAlert } from "../types";


const getAlertsCollection = (userId: string) => {
    return collection(db, "users", userId, "alerts");
};

export const fetchAlerts = async (userId: string): Promise<SavedAlert[]> => {
    try {
        const q = query(getAlertsCollection(userId));
        const querySnapshot = await getDocs(q);
        const alerts: SavedAlert[] = [];
        querySnapshot.forEach((doc) => {
            alerts.push({ id: doc.id, ...doc.data() } as SavedAlert);
        });
        return alerts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return [];
    }
};

export const addAlert = async (userId: string, address: string): Promise<void> => {
    try {
        if (!address) throw new Error("Address cannot be empty.");
        const newAlertRef = doc(getAlertsCollection(userId), address);
        await setDoc(newAlertRef, { address, emailEnabled: true, createdAt: Date.now() });
    } catch (error) {
        console.error("Error adding alert:", error);
        throw error;
    }
};

export const removeAlert = async (userId: string, address: string): Promise<void> => {
    try {
        const alertRef = doc(getAlertsCollection(userId), address);
        await deleteDoc(alertRef);
    } catch (error) {
        console.error("Error removing alert:", error);
        throw error;
    }
};

export const toggleAlertEmail = async (userId: string, address: string, currentStatus: boolean): Promise<void> => {
    try {
        const alertRef = doc(getAlertsCollection(userId), address);
        await updateDoc(alertRef, { emailEnabled: !currentStatus });
    } catch (error) {
        console.error("Error toggling alert email status:", error);
        throw error;
    }
};
