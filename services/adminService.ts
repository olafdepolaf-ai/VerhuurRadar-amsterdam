import { collection, addDoc, query, orderBy, limit, getDocs, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface SearchLog {
  id?: string;
  address: string;
  timestamp: any;
  userId?: string;
}

const SEARCH_LOGS_COLLECTION = "search_logs";

export const logSearch = async (address: string, userId?: string): Promise<void> => {
  try {
    await addDoc(collection(db, SEARCH_LOGS_COLLECTION), {
      address,
      userId: userId || 'anonymous',
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log search:", error);
  }
};

export const getTodaySearchCount = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, SEARCH_LOGS_COLLECTION),
      where("timestamp", ">=", today)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Failed to fetch today search count:", error);
    return 0;
  }
};

export const getRecentSearches = async (limitCount: number = 10): Promise<SearchLog[]> => {
  try {
    const q = query(
      collection(db, SEARCH_LOGS_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const searches: SearchLog[] = [];
    querySnapshot.forEach((doc) => {
      searches.push({ id: doc.id, ...doc.data() } as SearchLog);
    });
    return searches;
  } catch (error) {
    console.error("Failed to fetch recent searches:", error);
    return [];
  }
};
