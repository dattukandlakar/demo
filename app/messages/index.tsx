// app/messages/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { ArrowLeft, Edit } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar';
// --- FIX: Import the missing Button component ---
import Button from '@/components/ui/Button'; 
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { socketService } from '@/services/socketService';
// --- FIX: Import the acceptMessageRequest API function ---
import { getConversations, getMessageRequests, acceptMessageRequest } from '@/api/conversation';

// This interface should match your backend's conversation object
interface ApiConversation {
  _id: string;
  participants: [{
    _id: string;
    name: string;
    profileImage?: string;
  }];
  lastMessage?: {
    _id: string;
    content: string;
    createdAt: string;
    sender: { _id: string };
    readBy: string[];
  };
  status: 'active' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// A simple TabBar component for the UI
const MessagesTabBar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
      onPress={() => onTabChange('messages')}
    >
      <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>Messages</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
      onPress={() => onTabChange('requests')}
    >
      <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Requests</Text>
    </TouchableOpacity>
  </View>
);

export default function MessagesScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('messages');
  
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [requests, setRequests] = useState<ApiConversation[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // --- API Fetching Logic ---
  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    if (!isRefresh) setIsLoading(true);
    
    try {
      await Promise.all([
        getConversations(token).then(res => {
          if (res.success) setConversations(res.body || []);
        }),
        getMessageRequests(token).then(res => {
          if (res.success) setRequests(res.body || []);
        }),
      ]);
    } catch (error: any) {
      console.error('--- MSG LIST DEBUG: ❌ ERROR fetching data:', error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, []) // Run only once when screen comes into focus
  );

  // --- Socket Listener for real-time updates ---
  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket) {
      const handleNewData = () => {
        console.log('--- MSG LIST DEBUG: [EVENT] received, refetching all data for consistency.');
        fetchAllData(true); // Fetch as a refresh to avoid full screen loader
      };
      socket.on('newMessage', handleNewData);
      socket.on('requestAccepted', handleNewData);
      return () => {
        socket.off('newMessage', handleNewData);
        socket.off('requestAccepted', handleNewData);
      };
    }
  }, [fetchAllData]);
  
  // --- FIX: Implement the accept request handler ---
  const handleAcceptRequest = async (conversationId: string) => {
    setAcceptingId(conversationId);
    try {
        const response = await acceptMessageRequest(conversationId, token);
        if (response.success) {
            Alert.alert("Request Accepted", "You can now chat with this user.");
            // Refresh the lists to move the item from requests to messages
            fetchAllData(true);
        } else {
            throw new Error(response.message || "Could not accept request.");
        }
    } catch (error: any) {
        Alert.alert("Error", error.message);
    } finally {
        setAcceptingId(null);
    }
  };

  const handleConversationPress = (item: ApiConversation) => {
    const otherUser = item.participants.find(p => p._id !== user?.id) || item.participants[0];
    if (!otherUser) return;
    router.push({
      pathname: `/messages/${item._id}`,
      params: { otherUserName: otherUser.name, otherUserAvatar: otherUser.profileImage || '' },
    });
  };

  const renderConversationItem = ({ item }: { item: ApiConversation }) => {
    const otherUser = item.participants.find(p => p._id !== user?.id) || item.participants;
    if (!otherUser) return null;
    const lastMsg = item.lastMessage;
    const sentByMe = lastMsg?.sender._id === user?.id;
    const isRead = lastMsg ? lastMsg.readBy.includes(user?.id ?? '') : true;

    return (
      <TouchableOpacity onPress={() => handleConversationPress(item)} style={styles.conversationItem}>
        <Avatar source={otherUser.profileImage || ''} size={56} />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{otherUser.name}</Text>
            <Text style={styles.timestamp}>{new Date(lastMsg?.createdAt || item.updatedAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={[styles.lastMessage, !isRead && !sentByMe && styles.unreadMessage]} numberOfLines={1}>
              {sentByMe ? 'You: ' : ''}{lastMsg?.content || 'Conversation started.'}
            </Text>
            {!isRead && !sentByMe && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // --- UPDATED RENDER FUNCTION FOR REQUESTS ---
  const renderRequestItem = ({ item }: { item: ApiConversation }) => {
    const otherUser = item.participants.find(p => p._id !== user?.id) || item.participants[0];
    if (!otherUser) return null;

    return (
      // The entire item is now a button that navigates to the chat screen
      <TouchableOpacity 
        onPress={() => handleConversationPress(item)} 
        style={styles.requestItem}
      >
        <Avatar source={otherUser.profileImage || ''} size={56} />
        <View style={styles.requestContent}>
          <Text style={styles.userName}>{otherUser.name}</Text>
          <Text style={styles.requestText}>Wants to send you a message.</Text>
        </View>
        {/* <Button title="Accept" onPress={() => console.log("Accepting... id:", item._id)} variant="primary" style={{ height: 36, paddingHorizontal: 12}} /> */}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Messages', headerStyle: { backgroundColor: Colors.dark.background, }, headerTitleStyle: { color: Colors.dark.text, fontSize: 18, fontWeight: '600' }, headerTintColor: Colors.dark.text, headerShadowVisible: false, headerLeft: () => (<TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 8 }}><ArrowLeft size={24} color={Colors.dark.text} /></TouchableOpacity>), headerRight: () => (<TouchableOpacity onPress={() => router.push('/search/index')} style={{ paddingHorizontal: 8 }}><Edit size={22} color={Colors.dark.text} /></TouchableOpacity>) }} />
      <MessagesTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.dark.tint} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={activeTab === 'messages' ? conversations : requests}
          keyExtractor={(item) => item._id}
          renderItem={activeTab === 'messages' ? renderConversationItem : renderRequestItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.tint} />}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>{`No ${activeTab} found.`}</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: Colors.dark.tint },
  tabText: { color: Colors.dark.subtext, fontSize: 16, fontWeight: '500' },
  activeTabText: { color: Colors.dark.text },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: Colors.dark.subtext },
  conversationItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  conversationContent: { marginLeft: 12, flex: 1, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  userName: { color: Colors.dark.text, fontSize: 16, fontWeight: '600' },
  timestamp: { color: Colors.dark.subtext, fontSize: 12 },
  messageContainer: { flexDirection: 'row', alignItems: 'center' },
  lastMessage: { color: Colors.dark.subtext, fontSize: 14, flex: 1 },
  unreadMessage: { color: Colors.dark.text, fontWeight: 'bold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.tint, marginLeft: 8 },
  requestItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  requestContent: { marginLeft: 12, flex: 1 },
  requestText: { color: Colors.dark.subtext, fontSize: 14, marginTop: 4},
  acceptButton: { height: 36, paddingHorizontal: 16 }
});