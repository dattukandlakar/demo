import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { Bookmark, Share2, ExternalLink, ThumbsUp, Heart } from 'lucide-react-native';
import { NewsArticle } from '@/types';
import { useNewsStore } from '@/store/news-store';
import Colors from '@/constants/colors';
import SimpleInAppBrowser from '../ui/SimpleInAppBrowser';

const { width, height } = Dimensions.get('window');

interface NewsCardProps {
  article: NewsArticle;
  onPress: (article: NewsArticle) => void;
  onBookmark?: (articleId: string) => void;
  fullScreen?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ 
  article, 
  onPress, 
  onBookmark,
  fullScreen = false 
}) => {
  const { bookmarkArticle, likeArticle } = useNewsStore();
  const [showInAppBrowser, setShowInAppBrowser] = useState(false);

  const handleBookmark = () => {
    console.log("Book")
    if (onBookmark) {
      onBookmark(article._id);
    } else {
      bookmarkArticle(article._id);
    }
  };

  const handleLike = (articleId : string) => {
    likeArticle(articleId);
  }

  const handleShare = () => {
    // Share functionality would go here
    console.log("Sharing")
  };

  const handleOpenSource = () => {
    Linking.openURL(article.ref);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  const getLines = (headline : String) => {
    if (headline.length < 70 ) {
      return 5;
    } 
    return 4;
  }

  if (fullScreen) {
    return (
      <TouchableOpacity 
        style={styles.fullScreenContainer} 
        onPress={() => onPress(article)}
        activeOpacity={0.95}
      >
        <Image source={{ uri: article.bannerImage }} style={styles.fullScreenImage} />
        
        <View style={styles.fullScreenContent}>
          <View style={styles.sourceContainer}>
            <Text style={styles.source}>{article.source}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.time}>{formatDate(article.timestamp)}</Text>
          </View>
          
          <Text style={styles.fullScreenTitle} 
           numberOfLines={3}
            ellipsizeMode="tail">
            {article.headline}
          </Text>
          
          <Text 
            style={styles.summary} 
            numberOfLines={getLines(article.headline)}
            ellipsizeMode="tail"
          >
            {article.article}
          </Text>

          <TouchableOpacity onPress={() => onPress(article)}>
            <Text style={[styles.actionText, { color: Colors.dark.tint, marginTop: 0, fontSize: 13 }]}>
              Read More...
            </Text>
          </TouchableOpacity>

          <View style={styles.articleActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(article._id)}>
          <Heart 
            size={24} 
            color={article.isLiked ? 'red' : Colors.dark.text}
            fill={article.isLiked ? 'red' : 'none'}
          />
          <Text style={styles.actionCount}>{article.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={24} color={Colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleBookmark()}>
          <Bookmark 
            size={24} 
            color={Colors.dark.text} 
            fill={article.isSaved ? Colors.dark.text : 'transparent'} 
          />
        </TouchableOpacity>
         </View>
        </View>

      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(article)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: article.bannerImage }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.headline}
        </Text>
        
        <View style={styles.sourceContainer}>
          <Text style={styles.source}>{article.source}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.time}>{formatDate(article.timestamp)}</Text>
        </View>
        
        <Text style={styles.summary}>
          {article.article}
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {setShowInAppBrowser(true)}}>
            <ExternalLink size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(article._id)}>
          <Heart 
            size={24} 
            color={article.isLiked ? 'red' : Colors.dark.text}
            fill={article.isLiked ? 'red' : 'none'}
          />
          <Text style={styles.actionCount}>{article.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={24} color={Colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleBookmark()}>
          <Bookmark 
            size={24} 
            color={Colors.dark.text} 
            fill={article.isSaved ? Colors.dark.text : 'transparent'} 
          />
        </TouchableOpacity>
        </View>
      </View>
      <SimpleInAppBrowser
              visible={showInAppBrowser}
              url={article.ref || 'https://www.google.com'}
              title={article.headline}
              onClose={() => setShowInAppBrowser(false)}
            />
    </TouchableOpacity>
    
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 8,
    lineHeight: 24,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  source: {
    color: Colors.dark.tint,
    fontSize: 14,
    fontWeight: '500',
  },
  dot: {
    color: Colors.dark.subtext,
    marginHorizontal: 6,
  },
  time: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  summary: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: Colors.dark.text,
    fontSize: 12,
    marginLeft: 4,
  },
  // Full screen styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullScreenImage: {
    width: '100%',
    height: '40%',
    borderRadius: 5,
    marginBottom: 10
  },
  fullScreenContent: {
    flex: 1,
  },
  fullScreenTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 22,
  },
  fullScreenSummary: {
     textAlign: 'justify',
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 18,
  },
  articleActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  actionCount: {
    display:'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.dark.text,
    marginTop: 4,
    fontSize: 15,
    paddingLeft: 3
  },
});

export default NewsCard;
