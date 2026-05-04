import { AppBackground } from "@/components/AppBackground";
import { MailCard } from "@/components/MailCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExternalMail } from "@/services/mail";
import * as Network from "expo-network";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
      const networkState = await Network.getNetworkStateAsync();
      const isConnected =
        networkState.isConnected && networkState.isInternetReachable !== false;

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "You are offline. Please connect to the internet to load history.",
        );
        setMails([]);
        return;
      }

      const response = await fetch(API_LIST, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.log("Server returned an error:", response.status);
        Alert.alert("Error", "Failed to load history.");
        setMails([]);
        return;
      }

      const result = await response.json();
      console.log("Raw API response:", result);

      const data: ExternalMail[] = (result.mails || []).map((mail: any) => ({
        id: mail.id?.toString() || Math.random().toString(),
        referenceNumber: mail.reference_number || "N/A",
        from: mail.address || "Unknown",
        contact: mail.contact || "n/a",
        received_by: mail.received_by || "n/a",
        date: mail.mail_sent_date || "",
        status: "Received",
      }));

      setMails(data);
    } catch (error) {
      console.log("Failed to fetch mails:", error);
      Alert.alert(
        "Connection Error",
        "Unable to load history. Please check your internet connection and try again.",
      );
      setMails([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMails();
    }, []),
  );

  useEffect(() => {
    fetchMails();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMails();
  }, []);

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header Section */}
        <View className="bg-white/95 px-5 pt-6 pb-4 border-b border-gray-100">
          <View className="flex-row items-baseline justify-between">
            <View>
              <Text className="text-3xl font-bold text-gray-900 tracking-tight">
                History
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-gray-500 text-sm">
                  Previously confirmed receipts
                </Text>
              </View>
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-semibold">
                {mails.length} confirmed
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={mails}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MailCard mail={item} />}
            contentContainerStyle={{
              paddingBottom: 100,
              paddingHorizontal: 16,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
              />
            }
            ListEmptyComponent={
              <View className="py-20 items-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                  <IconSymbol name="clock.fill" size={30} color="#9CA3AF" />
                </View>
                <Text className="text-gray-400 text-base">
                  No history found
                </Text>
                <Text className="text-gray-300 text-sm mt-1">
                  Confirmed receipts will appear here
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </AppBackground>
  );
}
