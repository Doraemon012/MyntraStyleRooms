import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/auth-context';
import { useSession } from '../../contexts/session-context';
import socketService from '../../services/socketService';
// import VoiceCallControls from './VoiceCallControls';
// import VoiceCallParticipants from './VoiceCallParticipants';

interface LiveBrowsePanelProps {
  onFollowUser?: (userId: string) => void;
  currentUserId?: string;
}

export default function LiveBrowsePanel({ onFollowUser, currentUserId }: LiveBrowsePanelProps) {
  const { sessionParticipants, followingUserId, setFollowingUser, sessionRoomId, setParticipantProduct } = useSession() as any;
  const { user } = useAuth() as any;
  const [expanded, setExpanded] = React.useState(false);
  
  // Listen for browse updates to update participant products
  React.useEffect(() => {
    if (!sessionRoomId) return;
    
    console.log('🔍 LiveBrowsePanel setting up browse update listeners for room:', sessionRoomId);
    
    socketService.updateCallbacks({
      onBrowseUpdate: (data) => {
        console.log('📥 LiveBrowsePanel received browse update:', data);
        console.log('📥 Current user ID:', currentUserId);
        console.log('📥 Data user ID:', data?.userId);
        if (data?.userId) {
          console.log('📥 Updating participant product for:', data.userId);
          setParticipantProduct(data.userId, data.productId ? {
            id: data.productId,
            name: data.productTitle,
            image: data.productImage,
          } : null);
        } else {
          console.log('📥 Skipping browse update - no user ID');
        }
      }
    });
  }, [sessionRoomId, currentUserId, setParticipantProduct]);
  
  // Show all participants including current user, but coalesce duplicates for current user
  const allParticipants = React.useMemo(() => {
    const effectiveCurrentUserId = currentUserId || user?._id;
    if (!effectiveCurrentUserId) return sessionParticipants;
    const byKey = new Map<string, any>();
    for (const p of sessionParticipants) {
      const isSelf = p.id === effectiveCurrentUserId; // only ID-based self merge
      const key = isSelf ? effectiveCurrentUserId : p.id;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, p);
      } else {
        // Prefer the entry that has a currentProduct
        const existingHasProduct = !!existing.currentProduct;
        const incomingHasProduct = !!p.currentProduct;
        if (!existingHasProduct && incomingHasProduct) {
          byKey.set(key, p);
        } else if (existingHasProduct === incomingHasProduct) {
          // Prefer more complete avatar/name
          const existingScore = (existing.avatar ? 1 : 0) + (existing.name ? 1 : 0);
          const incomingScore = (p.avatar ? 1 : 0) + (p.name ? 1 : 0);
          if (incomingScore > existingScore) byKey.set(key, p);
        }
      }
    }
    return Array.from(byKey.values());
  }, [sessionParticipants, currentUserId, user]);
  
  console.log('🔍 LiveBrowsePanel participants count:', sessionParticipants.length);
  console.log('🔍 LiveBrowsePanel participants:', sessionParticipants.map((p: any) => `${p.name} (${p.id}) - Product: ${p.currentProduct?.name || 'None'}`));
  console.log('🔍 LiveBrowsePanel currentUserId:', currentUserId);
  console.log('🔍 LiveBrowsePanel all participants:', allParticipants.map((p: any) => `${p.name} (${p.id}) - Product: ${p.currentProduct?.name || 'None'}`));
  const viewersOnly = React.useMemo(() => allParticipants.filter((p: any) => !!p.currentProduct), [allParticipants]);
  
  // Debug: Check if current user has a product
  const currentUserParticipant = sessionParticipants.find((p: any) => p.id === currentUserId);
  console.log('🔍 Current user participant:', currentUserParticipant ? {
    name: currentUserParticipant.name,
    id: currentUserParticipant.id,
    hasProduct: !!currentUserParticipant.currentProduct,
    productName: currentUserParticipant.currentProduct?.name
  } : 'Not found');
  
  // Debug: Check for duplicates
  const participantIds = sessionParticipants.map((p: any) => p.id);
  const uniqueIds = [...new Set(participantIds)];
  if (participantIds.length !== uniqueIds.length) {
    console.warn('⚠️ Duplicate participants detected!', {
      total: participantIds.length,
      unique: uniqueIds.length,
      duplicates: participantIds.filter((id: any, index: number) => participantIds.indexOf(id) !== index)
    });
  } else {
    console.log('✅ No duplicate participants detected');
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {!expanded && (
        <View style={styles.floatingBar}>
          {viewersOnly.length > 0 ? (
            viewersOnly.map((p: any) => (
              <View key={p.id} style={styles.avatarWrap}>
                <View style={styles.avatarRow}>
                  <View style={styles.avatarCircle}>
                    <Image source={{ uri: p.avatar }} style={styles.avatarImage} contentFit="cover" />
                  </View>
                  <Image source={{ uri: p.currentProduct.image }} style={styles.thumbSquare} contentFit="cover" />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noParticipantsContainer}>
              <Text style={styles.noParticipantsText}>No one is viewing a product</Text>
            </View>
          )}
          <TouchableOpacity style={styles.expandBtn} onPress={() => setExpanded(true)}>
            <Text style={styles.expandText}>⋯</Text>
          </TouchableOpacity>
        </View>
      )}

      {expanded && (
        <View style={styles.expandedPanel}>
          <View style={styles.expandedHeader}>
            <Text style={styles.headerTitle}>Live Browsing</Text>
            <TouchableOpacity onPress={() => setExpanded(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          {viewersOnly.map((p: any) => {
            const effectiveCurrentUserId = currentUserId || user?._id;
            const isSelf = effectiveCurrentUserId && (p.id === effectiveCurrentUserId);
            const selfName = user?.name || p.name;
            const displayName = isSelf ? `${selfName} (you)` : (p.name === 'You' && user?.name ? user.name : p.name);
            return (
            <View key={p.id} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowAvatarCircle}>
                  <Image source={{ uri: p.avatar }} style={styles.rowAvatar} contentFit="cover" />
                </View>
                {p.currentProduct ? (
                  <>
                    <Image source={{ uri: p.currentProduct.image }} style={styles.rowThumb} />
                    <View style={styles.rowInfo}>
                      <Text numberOfLines={1} style={styles.rowName}>{displayName}</Text>
                      <Text numberOfLines={1} style={styles.rowProduct}>{p.currentProduct.name}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.rowInfo}>
                    <Text numberOfLines={1} style={styles.rowName}>{displayName}</Text>
                    <Text numberOfLines={1} style={styles.rowProduct}>Browsing…</Text>
                  </View>
                )}
              </View>
              {p.id !== effectiveCurrentUserId ? (
                <TouchableOpacity
                  style={[styles.followBtn, followingUserId === p.id && styles.unfollowBtn]}
                  onPress={() => {
                    if (!sessionRoomId || !user) return;
                    if (followingUserId === p.id) {
                      socketService.unfollowUser(sessionRoomId);
                      setFollowingUser(null);
                    } else {
                      // Ensure we receive follow events
                      socketService.joinUser(user._id);
                      socketService.followUser(sessionRoomId, p.id);
                      setFollowingUser(p.id);
                      // Optimistically navigate to leader's current product if available
                      if (p.currentProduct?.id) {
                        router.replace(`/product/${p.currentProduct.id}` as any);
                      }
                    }
                  }}
                >
                  <Text style={styles.followText}>{followingUserId === p.id ? 'Unfollow' : 'Follow'}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.currentUserIndicator}>
                  <Text style={styles.currentUserText}>{`${selfName} (you)`}</Text>
                </View>
              )}
            </View>
          )})}
        </View>
      )}

      {/* Voice Call Controls - Temporarily disabled */}
      {/* <VoiceCallControls /> */}

      {/* Voice Call Participants Modal - Temporarily disabled */}
      {/* <VoiceCallParticipants 
        isVisible={showVoiceParticipants} 
        onClose={() => setShowVoiceParticipants(false)} 
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    top: 100,
    zIndex: 50,
  },
  floatingBar: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrap: {
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  thumbSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEE',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginLeft: -10, // slight overlap over avatar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tooltip: {
    marginTop: 6,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 6,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipImage: {
    width: '100%',
    height: 70,
    borderRadius: 6,
    marginBottom: 6,
  },
  tooltipText: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  tooltipUser: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  expandBtn: {
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  expandText: {
    fontSize: 14,
    color: '#333',
  },
  expandedPanel: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rowAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#F6F5F5',
  },
  rowAvatar: {
    width: 30,
    height: 30,
  },
  rowThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#EEE',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 12,
    color: '#000',
    fontWeight: '700',
  },
  rowProduct: {
    fontSize: 11,
    color: '#666',
  },
  followBtn: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unfollowBtn: {
    backgroundColor: '#666',
  },
  followText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noParticipantsContainer: {
    padding: 8,
    alignItems: 'center',
  },
  noParticipantsText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  currentUserIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currentUserText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});


