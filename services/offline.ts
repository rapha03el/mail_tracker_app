import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_CONFIRMATIONS_KEY = "pending_confirmations";

export interface PendingConfirmation {
  id: any;
  received_by: any;
  contact: any;
  mailId: string;
  signature: string;
  date: string;
}

export const OfflineStorage = {
  saveConfirmation: async (
    confirmation: PendingConfirmation,
  ): Promise<void> => {
    try {
      const existing = await OfflineStorage.getPendingConfirmations();
      const updated = [...existing, confirmation];
      await AsyncStorage.setItem(
        PENDING_CONFIRMATIONS_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("Failed to save offline confirmation", error);
      throw error;
    }
  },

  getPendingConfirmations: async (): Promise<PendingConfirmation[]> => {
    try {
      const json = await AsyncStorage.getItem(PENDING_CONFIRMATIONS_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error("Failed to get offline confirmations", error);
      return [];
    }
  },

  clearConfirmations: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(PENDING_CONFIRMATIONS_KEY);
    } catch (error) {
      console.error("Failed to clear offline confirmations", error);
    }
  },

  removeConfirmation: async (mailId: string): Promise<void> => {
    try {
      const existing = await OfflineStorage.getPendingConfirmations();
      const updated = existing.filter((c) => c.mailId !== mailId);
      await AsyncStorage.setItem(
        PENDING_CONFIRMATIONS_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("Failed to remove confirmation", error);
    }
  },
};
