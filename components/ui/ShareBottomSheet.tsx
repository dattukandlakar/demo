// components/ui/ShareBottomSheet.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { X, Search, CheckSquare, Square, Send } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

// Import all necessary API functions
import { getConversations, sendMessage, findOrCreateConversation } from '@/api/conversation';
import { getFollowers } from '@/api/user';

interface ShareableUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'Conversation' | 'Follower';
}

interface ShareBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  contentId: string | null;
  contentType: 'post' | 'news' | null;
}

export const ShareBottomSheet = ({
  visible,
  onClose,
  contentId,
  contentType,
}: ShareBottomSheetProps) => {
  const { user, token } = useAuthStore();
  const [recipients, setRecipients] = useState<ShareableUser[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (visible && token) {
      const fetchRecipients = async () => {
        setIsLoading(true);
        try {
          const [convResponse, followResponse] = await Promise.all([
            getConversations(token),
            getFollowers(token),
          ]);

          const combinedList: ShareableUser[] = [];
          const seenUserIds = new Set<string>();

          if (convResponse.success && convResponse.body) {
            convResponse.body.forEach((conv: any) => {
              const otherUser = conv.participants.find((p: any) => p._id !== user?.id);
              if (otherUser && !seenUserIds.has(otherUser._id)) {
                combinedList.push({
                  id: otherUser._id,
                  name: otherUser.name,
                  avatar: otherUser.profileImage,
                  type: 'Conversation',
                });
                seenUserIds.add(otherUser._id);
              }
            });
          }

          if (followResponse.success && followResponse.body) {
            followResponse.body.forEach((follower: any) => {
              if (!seenUserIds.has(follower._id)) {
                combinedList.push({
                  id: follower._id,
                  name: follower.name,
                  avatar: follower.profileImage,
                  type: 'Follower',
                });
                seenUserIds.add(follower._id);
              }
            });
          }
          
          setRecipients(combinedList);
        } catch (error) {
          console.error("Failed to fetch recipients:", error);
          Alert.alert("Error", "Could not load your contacts. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecipients();
    } else {
      setRecipients([]);
      setSelectedRecipients([]);
      setSearchQuery('');
    }
  }, [visible, token, user?.id]);

  const handleSelectRecipient = (id: string) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };
  
  // --- UPDATED SHARE LOGIC ---
  const handleShare = async () => {
    if (!contentId || !contentType || selectedRecipients.length === 0 || !token) return;
    setIsSending(true);

    const sharePromises = selectedRecipients.map(async (recipientId) => {
      try {
        // Step 1: Find or create the conversation for this recipient
        const convResponse = await findOrCreateConversation(recipientId, token);
        if (!convResponse.success || !convResponse.body?._id) {
          throw new Error(`Could not start conversation with user ${recipientId}`);
        }
        const conversationId = convResponse.body._id;

        // Step 2: Prepare the message payload with the shared content
        const messagePayload = {
          sharedPostId: contentType === 'post' ? contentId : undefined,
          sharedNewsId: contentType === 'news' ? contentId : undefined,
          content: `Check out this ${contentType}!` // Optional text
        };

        // Step 3: Send the message
        await sendMessage(conversationId, messagePayload, token);

      } catch (error: any) {
        console.error(`Failed to share with recipient ${recipientId}:`, error);
        // We can collect errors to show a summary alert later
        return { success: false, recipientId }; 
      }
      return { success: true, recipientId };
    });

    try {
      const results = await Promise.all(sharePromises);
      const failedShares = results.filter(r => !r.success);

      if (failedShares.length > 0) {
        Alert.alert("Sharing Partially Failed", `Could not share with ${failedShares.length} people. Please try again.`);
      } else {
        Alert.alert("Success", "Your content has been shared!");
      }

      onClose(); // Close the sheet regardless of outcome
    } catch (e) {
      Alert.alert("Error", "An unexpected error occurred during sharing.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredRecipients = useMemo(() => {
    return recipients.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipients, searchQuery]);

  const renderRecipient = ({ item }: { item: ShareableUser }) => {
    const isSelected = selectedRecipients.includes(item.id);
    return (
      <TouchableOpacity style={styles.recipientRow} onPress={() => handleSelectRecipient(item.id)}>
        <Avatar source={item.avatar || undefined} size={48} />
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{item.name}</Text>
          <Text style={styles.recipientType}>{item.type}</Text>
        </View>
        {isSelected ? (
          <CheckSquare size={24} color={Colors.dark.primary} />
        ) : (
          <Square size={24} color={Colors.dark.subtext} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay} edges={['bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Share with...</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.dark.subtext} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for people..."
              placeholderTextColor={Colors.dark.subtext}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.dark.primary} style={{ flex: 1 }} />
          ) : (
            <FlatList
              data={filteredRecipients}
              keyExtractor={(item) => item.id}
              renderItem={renderRecipient}
              ListEmptyComponent={<Text style={styles.emptyText}>No contacts found.</Text>}
              contentContainerStyle={styles.listContainer}
            />
          )}

          <View style={styles.footer}>
            <Button
              title={`Send (${selectedRecipients.length})`}
              onPress={handleShare}
              disabled={selectedRecipients.length === 0 || isSending}
              isLoading={isSending}
              icon={<Send size={18} color="#fff" />}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    backgroundColor: Colors.dark.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.dark.text,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recipientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  recipientType: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.dark.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
});