import { View } from 'react-native';

// This is a shim for the blur effect on iOS
// In a real app with expo-blur, you would use BlurView here
export default function TabBarBackground() {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
        />
    );
}

export function useBottomTabOverflow() {
    return 0;
}
