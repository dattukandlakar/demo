// app/(tabs)/news.tsx

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RelativePathString, useRouter } from 'expo-router';
import { Filter, X, Bookmark, Heart, Share2, MessageCircle } from 'lucide-react-native';
import AppHeader from '@/components/layout/AppHeader';
import NewsCard from '@/components/news/NewsCard';
import Badge from '@/components/ui/Badge';
import { useNewsStore } from '@/store/news-store';
import { NewsArticle } from '@/types';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export default function NewsScreen() {
  const router = useRouter();
  const { articles, categories, fetchArticles, bookmarkArticle, isLoading } = useNewsStore();
  const insets = useSafeAreaInsets();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [fetchedRanges, setFetchedRanges] = useState<Set<number>>(new Set());


  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const batchSize = 10;
    const nextBatchStart = Math.floor((currentArticleIndex + 1) / batchSize + 1) * batchSize;
    const key = `${nextBatchStart}`;

    if (!fetchedRanges.has(nextBatchStart)) {
      fetchArticles(activeCategories[0], batchSize, nextBatchStart); 
      setFetchedRanges(prev => new Set(prev).add(nextBatchStart));
    }
  }, [currentArticleIndex]);


  const loadData = async () => {
    await fetchArticles();
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentArticleIndex(viewableItems[0].index);
    }
  }).current;


  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleArticlePress = (articleId: string) => {
    router.push({
      pathname: "/news/[id]" as RelativePathString,
      params: { id: articleId },
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCategorySelect = (category: string) => {
    let newActiveCategories = [...activeCategories];
    
    if (newActiveCategories.includes(category)) {
      newActiveCategories = newActiveCategories.filter(c => c !== category);
    } else {
      newActiveCategories.push(category);
    }
    
    setActiveCategories(newActiveCategories);
    fetchArticles(newActiveCategories.length > 0 ? newActiveCategories[0] : 'All');
  };

  const handleBookmark = (articleId: string) => {
    bookmarkArticle(articleId);
  };

  const renderHeader = () => (
    <>
      <View style={styles.filterHeader}>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={toggleFilters}
          >
            <Filter size={18} color={Colors.dark.text} />
            <Text style={styles.filterToggleText}>Categories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.savedButton}
            onPress={() => router.push('/saved')}
          >
            <Bookmark size={18} color={Colors.dark.text} />
            <Text style={styles.savedButtonText}>Saved</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activeFiltersContainer}>
          {activeCategories && activeCategories.length > 0 && activeCategories.map((category, index) => (
            <Badge 
              key={index}
              label={category}
              variant="primary"
              size="small"
              style={styles.filterBadge}
            />
          ))}
        </View>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {categories && categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryChip,
                    activeCategories && activeCategories.includes(category) && styles.activeCategoryChip
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text 
                    style={[
                      styles.categoryChipText,
                      activeCategories && activeCategories.includes(category) && styles.activeCategoryChipText
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setActiveCategories([]);
              fetchArticles();
            }}
          >
            <X size={16} color={Colors.dark.text} />
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderFullScreenArticle = ({ item }: { item: NewsArticle }) => {
    const articleHeight = height - insets.top - insets.bottom - 60;
    const innerSize = articleHeight * 0;
    return (
      <View style={[styles.fullScreenArticle, { height: articleHeight }]}>
        <View style={[styles.articleCardWrapper]}>
          <NewsCard 
            article={item} 
            onPress={() => handleArticlePress(item._id)} 
            onBookmark={() => handleBookmark(item._id)}
            fullScreen
          />
        </View>
      </View>
    );
};


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title="News"
        showCreatePost={false}
      />
      
      <View style={styles.contentContainer}>
        {renderHeader()}
        
        <FlatList
          data={articles}
          keyExtractor={(item) => item._id}
          renderItem={renderFullScreenArticle}
          pagingEnabled
          snapToAlignment="start"
          snapToInterval={height - insets.top - insets.bottom - 60}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={false}
          maxToRenderPerBatch={5}
          initialNumToRender={3}
          windowSize={7}
          scrollEventThrottle={16}
          disableIntervalMomentum={true}
          getItemLayout={(data, index) => ({
            length: height - insets.top - insets.bottom - 60,
            offset: (height - insets.top - insets.bottom - 60) * index,
            index,
          })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.tint}
              colors={[Colors.dark.tint]}
            />
          }
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  filterHeader: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  filterToggleText: {
    color: Colors.dark.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  savedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    flex: 1,
    justifyContent: 'center',
  },
  savedButtonText: {
    color: Colors.dark.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterBadge: {
    marginRight: 6,
    marginBottom: 6,
  },
  filtersContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    color: Colors.dark.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: Colors.dark.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 8,
  },
  activeCategoryChip: {
    backgroundColor: `${Colors.dark.tint}20`,
  },
  categoryChipText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  activeCategoryChipText: {
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  resetButtonText: {
    color: Colors.dark.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  fullScreenArticle: {
    width: width,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  articleCardWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  articleActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: Colors.dark.text,
    fontSize: 12,
  },
});
