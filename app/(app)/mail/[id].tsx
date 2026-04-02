import { useSession } from "@/ctx";
import { OfflineStorage } from "@/services/offline";
import * as Network from "expo-network";
import { Stack, router, useLocalSearchParams } from "expo-router";
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
  contact?: string; //field added
  received_by?: string; //field added
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

  // Fetch mail details
  useEffect(() => {
    if (!parsedMail) {
      fetchMail(); // fallback only if no data passed
    }
  }, []);

  const fetchMail = async () => {
    try {
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
      }));

      const found = data.find((m) => String(m.id) === String(mailId));

      setMail(found || null);
    } catch (error) {
      Alert.alert("Error", "Failed to load mail");
      console.error("Fetch mail error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => ref.current?.clearSignature();
  const handleConfirm = () => ref.current?.readSignature();

  // Handle signature submission
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

      // Keep base64 string as is (store in VARCHAR)
      const base64Data = signature.replace(/^data:image\/png;base64,/, "");

      if (isConnected) {
        const formData = new FormData();
        formData.append("id", mail.id);
        formData.append("received_by", receivedBy);
        formData.append("contact", contact);
        formData.append("signature", base64Data); // <-- store as base64 string
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
        // Save offline
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

  if (loading) return <ActivityIndicator className="flex-1" size="large" />;
  if (!mail) return <Text className="text-center mt-8">Mail not found</Text>;

  const isReceived = mail.status === "Received";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: mail.referenceNumber || "Mail Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        className="flex-1 p-4"
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* From */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">From</Text>
          <Text className="text-lg font-semibold text-gray-900">
            {mail.from}
          </Text>
        </View>

        {/* Date */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">Date</Text>
          <Text className="text-base text-gray-800">{mail.date}</Text>
        </View>

        <View className="h-[1px] bg-gray-200 my-2" />

        {/* Receiving Officer */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm mb-1">Receiving Officer</Text>
          <TextInput
            className="bg-gray-100 p-3 rounded-lg text-gray-600"
            value={receivedBy}
            onChangeText={setReceivedBy}
            editable={!isReceived}
            placeholder="Enter receiving officer name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Contact */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm mb-1">Contact Number</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900"
            placeholder="Enter contact number"
            value={contact}
            onChangeText={(text) => {
              // Remove anything that is not a digit
              const cleaned = text.replace(/[^0-9]/g, "");

              // Limit to 10 digits
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

        {/* Signature */}
        <Text className="text-gray-500 text-sm mb-2">Signature</Text>

        {isReceived ? (
          <View className="h-40 bg-gray-100 rounded-lg items-center justify-center border border-gray-200">
            <Text className="text-green-600 font-bold">Already Received</Text>
          </View>
        ) : (
          <View className="h-60 border border-gray-300 rounded-lg overflow-hidden bg-white">
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

        {!isReceived && (
          <View className="flex-row mt-4 space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-200 p-4 rounded-lg items-center"
              onPress={handleClear}
            >
              <Text className="text-gray-700 font-bold">Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-700 p-4 rounded-lg items-center"
              onPress={handleConfirm}
              disabled={submitting}
            >
              <Text className="text-white font-bold">
                {submitting ? "Submitting..." : "Confirm Receipt"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
