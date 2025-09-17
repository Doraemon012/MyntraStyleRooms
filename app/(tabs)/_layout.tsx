// import { Tabs } from 'expo-router';
// import React from 'react';

// import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E91E63',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingVertical: 6,
          paddingHorizontal: 16,
          height: 60,
        },
        
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarStyle: {
            display: 'none',
          }
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'fwd',
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: focused ? '#E91E63' : '#666', fontWeight: '500' }}>fwd</Text>
              <Text style={{ fontSize: 8, color: '#999', marginTop: 1 }}>Under ₹999</Text>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: focused ? '#E91E63' : '#666', fontWeight: '500' }}>fwd</Text>
              <Text style={{ fontSize: 8, color: '#999', marginTop: 1 }}>Under ₹999</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobes"
        options={{
          title: 'LUXE',
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: focused ? '#E91E63' : '#666', fontWeight: '500' }}>LUXE</Text>
              <Text style={{ fontSize: 8, color: '#999', marginTop: 1 }}>Luxury</Text>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: focused ? '#E91E63' : '#666', fontWeight: '500' }}>LUXE</Text>
              <Text style={{ fontSize: 8, color: '#999', marginTop: 1 }}>Luxury</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="bag-outline" size={20} color={focused ? '#E91E63' : '#666'} />
              <Text style={{ fontSize: 10, color: focused ? '#E91E63' : '#666', fontWeight: '500', marginTop: 2 }}>Bag</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}