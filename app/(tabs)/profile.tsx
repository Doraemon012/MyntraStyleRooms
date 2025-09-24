import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileStat {
  label: string;
  value: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
}

const profileStats: ProfileStat[] = [
  { label: 'Rooms Created', value: '12' },
  { label: 'Wardrobes', value: '8' },
  { label: 'Items Purchased', value: '24' },
  { label: 'Style Score', value: '85' },
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiRecommendationsEnabled, setAiRecommendationsEnabled] = useState(true);
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    { 
      id: '1', 
      title: 'Edit Profile', 
      icon: '✏️',
      onPress: () => router.push('/(tabs)/profile/edit')
    },
    { 
      id: '2', 
      title: 'Style Preferences', 
      icon: '🎨',
      onPress: () => router.push('/(tabs)/profile/style-preferences')
    },
    { 
      id: '3', 
      title: 'Notifications', 
      icon: '🔔', 
      hasSwitch: true, 
      switchValue: notificationsEnabled
    },
    { 
      id: '4', 
      title: 'Privacy Settings', 
      icon: '🔒',
      onPress: () => router.push('/(tabs)/profile/privacy')
    },
    { 
      id: '5', 
      title: 'AI Recommendations', 
      icon: '🤖', 
      hasSwitch: true, 
      switchValue: aiRecommendationsEnabled
    },
    { 
      id: '6', 
      title: 'Help & Support', 
      icon: '💬',
      onPress: () => router.push('/(tabs)/profile/support')
    },
    { 
      id: '7', 
      title: 'About', 
      icon: 'ℹ️',
      onPress: () => router.push('/(tabs)/profile/about')
    },
  ];

  const renderStat = (stat: ProfileStat, index: number) => (
    <View key={index} style={styles.statCard}>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const handleSwitchToggle = (id: string, value: boolean) => {
    if (id === '3') {
      setNotificationsEnabled(value);
    } else if (id === '5') {
      setAiRecommendationsEnabled(value);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      {item.hasSwitch ? (
        <Switch
          value={item.switchValue}
          onValueChange={(value) => handleSwitchToggle(item.id, value)}
          trackColor={{ false: '#e1e5e9', true: '#ff6b6b' }}
          thumbColor={item.switchValue ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Text style={styles.menuArrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>A</Text>
              </View>
              <TouchableOpacity style={styles.editImageButton}>
                <Text style={styles.editImageIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.userName}>{user?.name || 'User'}</ThemedText>
            <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>
            <Text style={styles.userLocation}>📍 {user?.location || 'Location not set'}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user?.stats?.roomsCreated || 0}</Text>
                <Text style={styles.statLabel}>Rooms Created</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user?.stats?.wardrobesOwned || 0}</Text>
                <Text style={styles.statLabel}>Wardrobes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user?.stats?.itemsPurchased || 0}</Text>
                <Text style={styles.statLabel}>Items Purchased</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user?.stats?.styleScore || 0}</Text>
                <Text style={styles.statLabel}>Style Score</Text>
              </View>
            </View>
          </View>

          <View style={styles.badgesSection}>
            <ThemedText style={styles.sectionTitle}>Style Badges</ThemedText>
            <View style={styles.badgesRow}>
              {user?.badges && user.badges.length > 0 ? (
                user.badges.slice(0, 3).map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeEmoji}>
                      {badge === 'trendsetter' ? '🌟' : 
                       badge === 'ethnic-expert' ? '👗' : 
                       badge === 'early-adopter' ? '🛍️' : 
                       badge === 'style-guru' ? '✨' : 
                       badge === 'shopping-pro' ? '🛒' : '🏆'}
                    </Text>
                    <Text style={styles.badgeText}>
                      {badge.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.badge}>
                  <Text style={styles.badgeEmoji}>🎯</Text>
                  <Text style={styles.badgeText}>No badges yet</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.menuSection}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>
            {menuItems.map(renderMenuItem)}
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  editImageIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  badgesSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuArrow: {
    fontSize: 20,
    color: '#999',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});