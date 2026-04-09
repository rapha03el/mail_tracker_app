import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExternalMail } from "@/services/mail";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface MailCardProps {
  mail: ExternalMail;
}

export function MailCard({ mail }: MailCardProps) {
  const isNotReceived = mail.status === "Not Received";

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
      <TouchableOpacity className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 flex-row items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isNotReceived ? "bg-orange-100" : "bg-green-100"}`}
        >
          <IconSymbol
            name={isNotReceived ? "hourglass" : "checkmark"}
            size={20}
            color={isNotReceived ? "#F97316" : "#22C55E"}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-xs text-gray-500 font-medium">
              {mail.referenceNumber}
            </Text>
            <Text className="text-xs text-gray-400">{mail.date}</Text>
          </View>
          <Text
            className="font-semibold text-gray-800 text-base mt-1"
            numberOfLines={1}
          >
            {mail.from}
          </Text>
        </View>
        {/* <Text className="text-xs text-gray-400">{mail.receivedby}</Text>
        <Text className="text-xs text-gray-400">{mail.contact}</Text> */}
        <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </Link>
  );
}
