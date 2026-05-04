import { Image, View, type ViewProps } from "react-native";

interface AppBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export function AppBackground({
  children,
  style,
  ...props
}: AppBackgroundProps) {
  return (
    <View className="flex-1 bg-gray-50 relative" {...props}>
      {/* Faint VRA Logo Circle - Centered (pointerEvents: none so taps go through) */}
      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none"
      >
        <View className="w-64 h-64 rounded-full items-center justify-end">
          <Image
            source={require("@/assets/images/vra-logo.png")}
            className="w-36 h-36 opacity-20"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content goes on top */}
      <View className="flex-1" style={[{ zIndex: 1 }, style]}>
        {children}
      </View>
    </View>
  );
}
