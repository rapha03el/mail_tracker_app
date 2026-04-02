import { MailCard } from "@/components/MailCard";
import { ExternalMail } from "@/services/mail";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const [mails, setMails] = useState<ExternalMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_LIST =
    "https://vraussd.vra.com/apis/api/externalmailsreceived/list";

  const fetchMails = async () => {
    try {
      const response = await fetch(API_LIST, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.error("Server returned an error:", response.status);
        setMails([]);
        return;
      }

      const result = await response.json();
      console.log("Raw API response:", result); // for debugging

      // Map API fields to ExternalMail type
      const data: ExternalMail[] = (result.mails || []).map((mail: any) => ({
        id: mail.id?.toString() || Math.random().toString(), // ensure string
        referenceNumber: mail.reference_number || "N/A",
        from: mail.address || "Unknown",
        contact: mail.contact || "n/a",
        received_by: mail.received_by || "n/a",
        date: mail.mail_sent_date || "",
        status: mail.status || "N/a",
      }));

      setMails(data);
    } catch (error) {
      console.error("Failed to fetch mails:", error);
      setMails([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMails();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMails();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4" edges={["top"]}>
      <View className="py-4">
        <Text className="text-2xl font-bold text-gray-900">History</Text>
        <Text className="text-gray-500">Previously confirmed receipts</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      ) : (
        <FlatList
          data={mails}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MailCard mail={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="py-10 items-center">
              <Text className="text-gray-400">No history found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
