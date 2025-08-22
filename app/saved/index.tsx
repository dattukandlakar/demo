import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Fullscreen } from 'lucide-react-native';
import PostCard from '@/components/home/PostCard';
import NewsCard from '@/components/news/NewsCard';
import JobCard from '@/components/jobs/JobCard';
import TabBar from '@/components/ui/TabBar';
import { usePostStore } from '@/store/post-store';
import { useNewsStore } from '@/store/news-store';
import { useJobStore } from '@/store/job-store';
import { Post, NewsArticle, Job } from '@/types';
import Colors from '@/constants/colors';

export default function SavedScreen() {
  const router = useRouter();
  const { posts } = usePostStore();
  const { articles } = useNewsStore();
  const { jobs } = useJobStore();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedArticles, setSavedArticles] = useState<NewsArticle[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const {getBookmarkedArticles} = useNewsStore();

  useEffect(() => {
    const loadData = async () => {
      setSavedPosts(posts.filter(post => post.isBookmarked));
      setSavedJobs(jobs.filter(job => job.isBookmarked));

      const bookmarkedArticles = await getBookmarkedArticles();
      if (bookmarkedArticles) {
        setSavedArticles(bookmarkedArticles);
      }
    };

    loadData();
  }, [posts, articles, jobs]);


  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handlePostPress = (post: Post) => {
    router.push(`/post/${post.id}`);
  };

  const handleArticlePress = (article: NewsArticle) => {
    router.push(`/news/${article._id}`);
  };

  const handleJobPress = (job: Job) => {
    router.push(`/job/${job.id}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No saved items</Text>
      <Text style={styles.emptyDescription}>
        Items you save will appear here for easy access.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Saved Items',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <TabBar
        tabs={[
          { id: 'posts', label: 'Posts' },
          { id: 'articles', label: 'Articles' },
          { id: 'jobs', label: 'Jobs' },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        style={styles.tabBar}
      />
      
      {activeTab === 'posts' && (
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {activeTab === 'articles' && (
        <FlatList
          data={savedArticles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NewsCard 
              article={item} 
              onPress={handleArticlePress} 
              
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {activeTab === 'jobs' && (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard 
              job={item} 
              onPress={handleJobPress} 
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backButton: {
    padding: 8,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});