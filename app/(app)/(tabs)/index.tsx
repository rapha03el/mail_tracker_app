import { AppBackground } from "@/components/AppBackground";
import { MailCard } from "@/components/MailCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExternalMail } from "@/services/mail";
import { OfflineStorage } from "@/services/offline";
import * as Network from "expo-network";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PendingScreen() {
  const [mails, setMails] = useState<ExternalMail[]>([]);
  const [filteredMails, setFilteredMails] = useState<ExternalMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const API_LIST = "https://vraussd.vra.com/apis/api/externalmails/list";
  const API_CONFIRM = "https://vraussd.vra.com/apis/api/externalmails";

  const syncOfflineConfirmations = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();

      if (
        !networkState.isConnected ||
        networkState.isInternetReachable === false
      ) {
        Alert.alert(
          "No Internet Connection",
          "You are offline. Pending confirmations will sync when internet is restored.",
        );
        return;
      }

      const pending = await OfflineStorage.getPendingConfirmations();
      if (!pending.length) return;

      setSyncing(true);

      for (const confirmation of pending) {
        const response = await fetch(API_CONFIRM, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: confirmation.id,
            received_by: confirmation.received_by,
            contact: confirmation.contact,
            signature: confirmation.signature,
          }),
        });

        if (response.ok) {
          await OfflineStorage.removeConfirmation(confirmation.id);
        }
      }
    } catch (err) {
      console.error("Offline sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const fetchMails = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const isConnected =
        networkState.isConnected && networkState.isInternetReachable !== false;

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "You are offline. Please connect to the internet to load pending mails.",
        );
        setMails([]);
        setFilteredMails([]);
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
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      const data: ExternalMail[] = (result.mails || []).map((mail: any) => ({
        id: mail.id.toString(),
        referenceNumber: mail.reference_number,
        from: mail.address,
        date: mail.mail_sent_date,
        status: mail.status,
      }));

      setMails(data);
      setFilteredMails(data);
    } catch (error: any) {
      console.error("Failed to fetch mails:", error);

      Alert.alert(
        "Connection Error",
        "Unable to load mails. Please check your internet connection and try again.",
      );

      setMails([]);
      setFilteredMails([]);
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
    syncOfflineConfirmations();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMails();
  }, []);

  useEffect(() => {
    if (search) {
      const lower = search.toLowerCase();
      setFilteredMails(
        mails.filter(
          (mail) =>
            mail.referenceNumber.toLowerCase().includes(lower) ||
            mail.from.toLowerCase().includes(lower),
        ),
      );
    } else {
      setFilteredMails(mails);
    }
  }, [search, mails]);

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header Section */}
        <View className="bg-white/95 px-5 pt-6 pb-4 border-b border-gray-100">
          <View className="flex-row items-baseline justify-between">
            <View>
              <Text className="text-3xl font-bold text-gray-900 tracking-tight">
                Pending Mail
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-gray-500 text-sm">
                  Confirm receipt of external documents
                </Text>
              </View>
            </View>
            <View className="bg-orange-100 px-3 py-1 rounded-full">
              <Text className="text-orange-700 text-xs font-semibold">
                {filteredMails.length} pending
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
            <IconSymbol name="magnifyingglass" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-800"
              placeholder="Search by reference or sender..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search !== "" && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text className="text-blue-500 text-sm font-medium">Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Syncing Indicator */}
        {syncing && (
          <View className="mx-5 mb-3 bg-blue-50 p-3 rounded-xl flex-row items-center justify-center border border-blue-100">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-blue-700 text-sm ml-2 font-medium">
              Syncing offline records...
            </Text>
          </View>
        )}

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={filteredMails}
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
                  <IconSymbol name="tray.fill" size={30} color="#9CA3AF" />
                </View>
                <Text className="text-gray-400 text-base">
                  No pending mails found
                </Text>
                <Text className="text-gray-300 text-sm mt-1">
                  Pull down to refresh
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </AppBackground>
  );
}
