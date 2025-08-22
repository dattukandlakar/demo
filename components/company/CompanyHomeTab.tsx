import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { usePostStore } from '@/store/post-store';
import PostCard from '@/components/home/PostCard';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { Company } from '@/store/company-store';

interface CompanyHomeTabProps {
  company: Company;
}

const CompanyHomeTab: React.FC<CompanyHomeTabProps> = ({ company }) => {
  const { posts, isLoading } = usePostStore();
  
  // Filter posts to show only company posts (in a real app, you'd have company posts)
  // For now, we'll just show the first 5 posts as a placeholder
  const companyPosts = posts.slice(0, 5);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.tint} />
      </View>
    );
  }
  
  if (companyPosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyText}>
            This company hasn't posted any updates yet. Check back later!
          </Text>
        </Card>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={companyPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    padding: 16,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
});

export default CompanyHomeTab;