import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OtherUserMessageProps {
  message: {
    id: string;
    text: string;
    timestamp: string;
    senderName: string;
    senderAvatar: string;
    reactions?: {
      thumbsUp: number;
      thumbsDown: number;
      heart: number;
      laugh: number;
      wow: number;
      sad: number;
      userThumbsUp: boolean;
      userThumbsDown: boolean;
      userHeart: boolean;
      userLaugh: boolean;
      userWow: boolean;
      userSad: boolean;
    };
  };
  onReaction: (messageId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => void;
}

export default function OtherUserMessage({ message, onReaction }: OtherUserMessageProps) {
  const handleReaction = (reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    onReaction(message.id, reactionType);
  };

  return (
    <View style={styles.messageWrapper}>
      {/* Other User Header */}
      <View style={styles.messageHeader}>
        <Image 
          source={{ uri: message.senderAvatar }} 
          style={styles.avatar} 
        />
        <Text style={styles.senderName}>{message.senderName}</Text>
      </View>

      {/* Message Container */}
      <View style={styles.messageContainer}>
        <View style={styles.messageContent}>
          <Text style={styles.otherMessageText}>
            {message.text}
          </Text>
          <Text style={styles.otherTimestamp}>
            {message.timestamp}
          </Text>
        </View>
      </View>

      {/* Reactions */}
      {message.reactions && (
        <View style={styles.reactions}>
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userThumbsUp && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('like')}
          >
            <Text style={styles.reactionEmoji}>👍</Text>
            <Text style={styles.reactionCount}>{message.reactions.thumbsUp}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userHeart && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('love')}
          >
            <Text style={styles.reactionEmoji}>❤️</Text>
            <Text style={styles.reactionCount}>{message.reactions.heart}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userLaugh && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('laugh')}
          >
            <Text style={styles.reactionEmoji}>😂</Text>
            <Text style={styles.reactionCount}>{message.reactions.laugh}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.reactionButton,
              message.reactions.userWow && styles.reactionButtonActive
            ]}
            onPress={() => handleReaction('wow')}
          >
            <Text style={styles.reactionEmoji}>😮</Text>
            <Text style={styles.reactionCount}>{message.reactions.wow}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageWrapper: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageContent: {
    padding: 16,
  },
  otherMessageText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
    marginBottom: 4,
  },
  otherTimestamp: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  reactions: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 6,
    backgroundColor: '#EAE8FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '500',
  },
});
