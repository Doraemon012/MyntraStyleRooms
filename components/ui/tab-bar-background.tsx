import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabBarBackground() {
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <BlurView
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      }}
      intensity={95}
      tint="extraLight"
    />
  );
}