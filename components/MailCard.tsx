import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExternalMail } from "@/services/mail";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface MailCardProps {
  mail: ExternalMail;
}

export function MailCard({ mail }: MailCardProps) {
  const isPending =
    mail.status === "Not Received" || mail.status !== "Received";
  const isReceived = mail.status === "Received";

  return (
    <Link
      href={{
        pathname: "/mail/[id]",
        params: {
          id: mail.id,
          mail: JSON.stringify(mail),
        },
      }}
      asChild
    >
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 overflow-hidden"
      >
        {/* Status Bar */}
        <View
          className={`h-1 ${isPending ? "bg-orange-500" : "bg-green-500"}`}
        />

        <View className="p-4">
          {/* Header Row: Reference + Date + Status Badge */}
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-2">
              <View
                className={`w-2 h-2 rounded-full ${isPending ? "bg-orange-500" : "bg-green-500"}`}
              />
              <Text className="text-xs font-mono text-gray-500">
                {mail.referenceNumber}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-400">📅 {mail.date}</Text>
              <View
                className={`px-2 py-0.5 rounded-full ${isPending ? "bg-orange-100" : "bg-green-100"}`}
              >
                <Text
                  className={`text-xs font-semibold ${isPending ? "text-orange-700" : "text-green-700"}`}
                >
                  {isPending ? "Pending" : "Received"}
                </Text>
              </View>
            </View>
          </View>

          {/* Sender */}
          <Text
            className="font-semibold text-gray-800 text-base mb-1"
            numberOfLines={1}
          >
            {mail.from}
          </Text>

          {/* Show received by for history items */}
          {isReceived && mail.received_by && (
            <View className="flex-row items-center mt-1">
              <IconSymbol name="person.fill" size={12} color="#9CA3AF" />
              <Text className="text-xs text-gray-400 ml-1">
                Received by: {mail.received_by}
              </Text>
            </View>
          )}

          {/* Arrow indicator */}
          <View className="absolute right-4 top-1/2 -translate-y-1/2">
            <IconSymbol name="chevron.right" size={18} color="#D1D5DB" />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
