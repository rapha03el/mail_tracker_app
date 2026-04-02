import { MailCard } from '@/components/MailCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExternalMail } from '@/services/mail';
import { OfflineStorage } from '@/services/offline';
import * as Network from 'expo-network';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PendingScreen() {
  const [mails, setMails] = useState<ExternalMail[]>([]);
  const [filteredMails, setFilteredMails] = useState<ExternalMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

  const API_LIST = 'https://vraussd.vra.com/apis/api/externalmails/list';
  const API_CONFIRM = 'https://vraussd.vra.com/apis/api/externalmails';

  const syncOfflineConfirmations = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) return;

      const pending = await OfflineStorage.getPendingConfirmations();
      if (!pending.length) return;

      setSyncing(true);
      for (const confirmation of pending) {
        const response = await fetch(API_CONFIRM, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: confirmation.id,
            received_by: confirmation.received_by,
            contact: confirmation.contact,
            signature: confirmation.signature
          })
        });
        if (response.ok) await OfflineStorage.removeConfirmation(confirmation.id);
      }
    } catch (err) {
      console.error('Offline sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

const fetchMails = async () => {
  try {
    const response = await fetch(API_LIST, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({}) // empty body for your API
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const result = await response.json();
    //console.log('Raw API response:', result);

    // Map API fields to ExternalMail type
    const data: ExternalMail[] = (result.mails || []).map((mail: any) => ({
      id: mail.id.toString(),
      referenceNumber: mail.reference_number,
      from: mail.address,
      date: mail.mail_sent_date,
      status: mail.status
    }));

    setMails(data);
    setRefreshing(false);

  } catch (error) {
    console.error("Fetch mail error:", error);
  } finally {
    setLoading(false);
  }
};

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
        mails.filter(mail =>
          mail.referenceNumber.toLowerCase().includes(lower) ||
          mail.from.toLowerCase().includes(lower)
        )
      );
    } else {
      setFilteredMails(mails);
    }
  }, [search, mails]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4" edges={['top']}>
      <View className="py-4">
        <Text className="text-2xl font-bold text-gray-900">Pending Mail</Text>
        <Text className="text-gray-500">Confirm receipt of external documents</Text>
      </View>

      <View className="mb-4 flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
        <IconSymbol name="magnifyingglass" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-800"
          placeholder="Search by ref, sender..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {syncing && (
        <View className="mb-4 bg-blue-50 p-2 rounded-lg flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#1D4ED8" />
          <Text className="text-blue-700 text-sm ml-2">Syncing offline records...</Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      ) : (
        <FlatList
          data={filteredMails}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MailCard mail={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="py-10 items-center">
              <Text className="text-gray-400">No pending mails found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}