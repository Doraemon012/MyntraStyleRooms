import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserMessageProps {
  message: {
    id: string;
    text: string;
    timestamp: string;
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

export default function UserMessage({ message, onReaction }: UserMessageProps) {
  const handleReaction = (reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    onReaction(message.id, reactionType);
  };

  return (
    <View style={styles.messageWrapper}>
      <LinearGradient
        colors={['#E91E63', '#FF6B9D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.messageContainer}
      >
        <View style={styles.messageContent}>
          <Text style={styles.userMessageText}>
            {message.text}
          </Text>
          <Text style={styles.userTimestamp}>
            {message.timestamp}
          </Text>
        </View>
      </LinearGradient>

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
    alignItems: 'flex-end',
  },
  messageContainer: {
    borderRadius: 16,
    maxWidth: '85%',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageContent: {
    padding: 16,
  },
  userMessageText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
    marginBottom: 4,
  },
  userTimestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  reactions: {
    flexDirection: 'row',
    marginTop: 8,
    marginRight: 6,
    backgroundColor: '#EAE8FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-end',
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
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
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
