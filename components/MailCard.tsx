import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExternalMail } from "@/services/mail";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface MailCardProps {
  mail: ExternalMail;
}

export function MailCard({ mail }: MailCardProps) {
  const isReceived = mail.status === "Received";
  const isPending = !isReceived;

  const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      <TouchableOpacity activeOpacity={0.95} className="mb-3">
        <View className="flex-row bg-[#F4F4F5] rounded-2xl border border-[#E4E4E7] overflow-hidden">
          {/* LEFT ACCENT */}
          <View
            className={`w-[3px] ${
              isPending ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />

          {/* CONTENT */}
          <View className="flex-1 p-4">
            {/* TOP ROW */}
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-base font-semibold text-gray-900 flex-1 pr-2"
                numberOfLines={1}
              >
                {mail.from}
              </Text>

              <View
                className={`px-2 py-0.5 rounded-full ${
                  isPending ? "bg-amber-100" : "bg-emerald-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isPending ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {isPending ? "Pending" : "Received"}
                </Text>
              </View>
            </View>

            {/* META */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <Text className="text-xs text-gray-500 font-mono">
                  {mail.referenceNumber}
                </Text>

                <View className="flex-row items-center">
                  <IconSymbol name="calendar" size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {mail.date}
                  </Text>
                </View>
              </View>
            </View>

            {/* EXTRA INFO */}
            {isReceived && (mail as any).confirmedAt && (
              <View className="flex-row items-center mt-2">
                <IconSymbol name="clock.fill" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">
                  Confirmed {formatDateTime((mail as any).confirmedAt)}
                </Text>
              </View>
            )}

            {isReceived && mail.received_by && !(mail as any).confirmedAt && (
              <View className="flex-row items-center mt-2">
                <IconSymbol name="person.fill" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">
                  Received by {mail.received_by}
                </Text>
              </View>
            )}
          </View>

          {/* CHEVRON */}
          <View className="justify-center pr-3">
            <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
