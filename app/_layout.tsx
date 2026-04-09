import 'react-native-reanimated';
import '../global.css';


export const unstable_settings = {
  anchor: '(tabs)',
};

import { SessionProvider } from '@/ctx';
import { Slot } from 'expo-router';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
