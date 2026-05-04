import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSession } from "@/ctx";
import { OfflineStorage } from "@/services/offline";
import * as Network from "expo-network";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignatureScreen, {
  SignatureViewRef,
} from "react-native-signature-canvas";

type ExternalMail = {
  id: string;
  referenceNumber: string;
  from: string;
  description?: string;
  date: string;
  status?: string;
  contact?: string;
  received_by?: string;
};

export default function MailDetails() {
  const { id, mail: mailParam } = useLocalSearchParams();

  const parsedMail = mailParam ? JSON.parse(mailParam as string) : null;
  const { session } = useSession();
  const mailId = Array.isArray(id) ? id[0] : id;

  const [mail, setMail] = useState<ExternalMail | null>(parsedMail);
  const [loading, setLoading] = useState(!parsedMail);
  const [contact, setContact] = useState(parsedMail?.contact || "");
  const [receivedBy, setReceivedBy] = useState(parsedMail?.received_by || "");

  const [submitting, setSubmitting] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const ref = useRef<SignatureViewRef>(null);

  const API_LIST = "https://vraussd.vra.com/apis/api/externalmails/list";
  const API_CONFIRM = "https://vraussd.vra.com/apis/api/externalmails";

  useEffect(() => {
    if (!parsedMail) {
      fetchMail();
    }
  }, []);

  const fetchMail = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const isConnected =
        networkState.isConnected && networkState.isInternetReachable !== false;

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "You are offline. Please connect to the internet to load mail details.",
        );
        setMail(null);
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

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();
      const data: ExternalMail[] = (result.mails || []).map((m: any) => ({
        id: m.id.toString(),
        referenceNumber: m.reference_number,
        from: m.address,
        description: "",
        date: m.mail_sent_date,
        status: m.status,
        contact: m.contact || "",
        received_by: m.received_by || "",
      }));

      const found = data.find((m) => String(m.id) === String(mailId));
      setMail(found || null);
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "Unable to load mail details. Please check your internet connection and try again.",
      );
      console.log("Fetch mail error:", error);
      setMail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => ref.current?.clearSignature();
  const handleConfirm = () => ref.current?.readSignature();

  const onOK = async (signature: string) => {
    if (!mail) return;

    if (!receivedBy.trim()) {
      Alert.alert(
        "Receiving Officer Required",
        "Please enter the receiving officer's name.",
      );
      return;
    }
    if (!contact.trim()) {
      Alert.alert("Contact Required", "Please enter contact number.");
      return;
    }
    if (!signature || signature.length < 1000) {
      Alert.alert("Signature Required", "Please sign before confirming.");
      return;
    }

    setSubmitting(true);

    try {
      const networkState = await Network.getNetworkStateAsync();
      const isConnected =
        networkState.isConnected && networkState.isInternetReachable !== false;

      const base64Data = signature.replace(/^data:image\/png;base64,/, "");

      if (isConnected) {
        const formData = new FormData();
        formData.append("id", mail.id);
        formData.append("received_by", receivedBy);
        formData.append("contact", contact);
        formData.append("signature", base64Data);
        formData.append("date", new Date().toISOString());

        const response = await fetch(API_CONFIRM, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Server error");

        setMail({
          ...mail,
          status: "Received",
          contact,
          received_by: receivedBy,
        });

        Alert.alert("Success", "Receipt confirmed successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        await OfflineStorage.saveConfirmation({
          id: mail.id,
          received_by: receivedBy,
          contact,
          signature: base64Data,
          date: new Date().toISOString(),
          mailId: "",
        });

        setMail({ ...mail, status: "Received" });
        Alert.alert(
          "Offline",
          "Receipt saved offline. It will sync when internet returns.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    } catch (error) {
      console.error("Receipt confirmation error:", error);
      Alert.alert("Error", "Failed to confirm receipt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  if (!mail)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Mail not found</Text>
      </View>
    );

  const isReceived = mail.status === "Received";

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: mail.referenceNumber || "Mail Details",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        className="flex-1"
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Status Banner */}
        <View
          className={`p-4 ${isReceived ? "bg-green-50" : "bg-orange-50"} border-b border-gray-100`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full ${isReceived ? "bg-green-500" : "bg-orange-500"} mr-2`}
              />
              <Text
                className={
                  isReceived
                    ? "text-green-700 font-semibold"
                    : "text-orange-700 font-semibold"
                }
              >
                {isReceived ? "✓ Already Received" : " Pending Confirmation"}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">
              Ref: {mail.referenceNumber}
            </Text>
          </View>
        </View>

        <View className="p-5">
          {/* From Card */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <IconSymbol name="building.2.fill" size={16} color="#3B82F6" />
              </View>
              <Text className="text-gray-500 text-sm">From</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              {mail.from}
            </Text>
          </View>

          {/* Date Card */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <IconSymbol name="calendar" size={16} color="#8B5CF6" />
              </View>
              <Text className="text-gray-500 text-sm">Date</Text>
            </View>
            <Text className="text-base text-gray-800">{mail.date}</Text>
          </View>

          <View className="h-px bg-gray-100 my-2" />

          {/* Receiving Officer */}
          <View className="mb-5">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              👤 Receiving Officer
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
              value={receivedBy}
              onChangeText={setReceivedBy}
              editable={!isReceived}
              placeholder="Enter receiving officer name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Contact Number */}
          <View className="mb-5">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              📞 Contact Number
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
              placeholder="Enter contact number"
              value={contact}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, "");
                if (cleaned.length <= 10) {
                  setContact(cleaned);
                }
              }}
              editable={!isReceived}
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Signature Section */}
          <View className="mb-5">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              ✍️ Signature
            </Text>

            {isReceived ? (
              <View className="bg-green-50 rounded-2xl p-8 items-center justify-center border border-green-100">
                <IconSymbol
                  name="checkmark.seal.fill"
                  size={40}
                  color="#22C55E"
                />
                <Text className="text-green-600 font-semibold mt-2">
                  Already Received
                </Text>
                {mail.received_by && (
                  <Text className="text-green-500 text-xs mt-1">
                    by {mail.received_by}
                  </Text>
                )}
              </View>
            ) : (
              <View className="h-56 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <SignatureScreen
                  ref={ref}
                  onOK={(sig) => {
                    setScrollEnabled(true);
                    onOK(sig);
                  }}
                  onBegin={() => setScrollEnabled(false)}
                  onEnd={() => setScrollEnabled(true)}
                  onClear={() => setScrollEnabled(true)}
                  descriptionText="Sign here"
                  clearText="Clear"
                  confirmText="Confirm"
                  webStyle={`.m-signature-pad--footer {display:none;} body,html {width:100%; height:100%;}`}
                />
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {!isReceived && (
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-4 rounded-xl items-center border border-gray-200"
                onPress={handleClear}
              >
                <Text className="text-gray-700 font-semibold">Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-4 rounded-xl items-center shadow-sm"
                onPress={handleConfirm}
                disabled={submitting}
              >
                <Text className="text-white font-semibold">
                  {submitting ? "Submitting..." : "✓ Confirm Receipt"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
