import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

export interface SavedAlert {
    id: string; // The address string acts as the ID
    address: string;
    emailEnabled: boolean;
    createdAt: number;
}

const getAlertsCollection = (userId: string) => {
    return collection(db, "users", userId, "alerts");
};

export const fetchAlerts = async (userId: string): Promise<SavedAlert[]> => {
    try {
        const alertsCollection = getAlertsCollection(userId);
        const q = query(alertsCollection);
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
        const alertsCollection = getAlertsCollection(userId);
        const newAlertRef = doc(alertsCollection, address); // Use address as document ID for uniqueness
        await setDoc(newAlertRef, {
            address: address,
            emailEnabled: true,
            createdAt: Date.now()
        });
    } catch (error) {
        console.error("Error adding alert:", error);
        throw error;
    }
};

export const removeAlert = async (userId: string, address: string): Promise<void> => {
    try {
        const alertsCollection = getAlertsCollection(userId);
        const alertRef = doc(alertsCollection, address);
        await deleteDoc(alertRef);
    } catch (error) {
        console.error("Error removing alert:", error);
        throw error;
    }
};

export const toggleAlertEmail = async (userId: string, address: string, currentStatus: boolean): Promise<void> => {
    try {
        const alertsCollection = getAlertsCollection(userId);
        const alertRef = doc(alertsCollection, address);
        await updateDoc(alertRef, {
            emailEnabled: !currentStatus
        });
    } catch (error) {
        console.error("Error toggling alert email status:", error);
        throw error;
    }
};
