import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { StoryCircle } from '@/components/ui/StoryCircle';
import { Story } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import MainStoryFlow from '../ui/MainStoryFlow';

interface StoriesSectionProps {
  stories: Story[];
  onStoryPress: (storyId: string, userStoriesGroup?: Story[], storyIndex?: number) => void;
  onAddStory: () => void;
  userStories: Story[];
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  onStoryPress,
  onAddStory,
  userStories,
}) => {
  const [showStoryFlow, setShowStoryFlow] = useState(false);
  const { user } = useAuthStore();

  const safeStories = Array.isArray(stories) ? stories : [];
  const safeUserStories = Array.isArray(userStories) ? userStories : [];

  const otherUserStories = safeStories.filter(story =>
    story?.user?.id && user?.id && story.user.id !== user.id
  );

  const groupedStories = otherUserStories.reduce((acc, story) => {
    const userId = story.user?.id;
    if (!userId) return acc;

    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // New function to handle pressing the user's own story circle
  const handleViewUserStories = () => {
    // Check if the user has any stories to view
    if (safeUserStories.length > 0) {
      // Find the latest story to use as a starting point
      const latestStory = safeUserStories[0];
      if (latestStory) {
        onStoryPress(latestStory.id, safeUserStories, 0); // Open the story viewer
      }
    } else {
      // If there are no stories, open the add story flow
      setShowStoryFlow(true);
    }
  };

  const handleAddNewStory = () => {
    setShowStoryFlow(true);
  };

  const handleOtherUserStoryPress = (story: Story) => {
    const userId = story.user?.id;
    if (!userId) return;

    const userStoriesGroup = groupedStories[userId] || [story];
    const storyIndex = userStoriesGroup.findIndex(s => s.id === story.id);

    onStoryPress(story.id, userStoriesGroup, Math.max(0, storyIndex));
  };

  const handleCloseStoryFlow = () => {
    setShowStoryFlow(false);
  };

  if (showStoryFlow) {
    return <MainStoryFlow onClose={handleCloseStoryFlow} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={80}
        snapToAlignment="start"
        removeClippedSubviews={true}
        directionalLockEnabled
      >
        {user && (
          <View style={styles.userStoryWrapper}>
            <StoryCircle
              imageUrl={user.avatar}
              name="Your Story"
              viewed={safeUserStories.every(s => s.viewed)}
              hasStories={safeUserStories.length > 0}
              onPress={handleViewUserStories}
              onAddStory={handleAddNewStory}
              streak={user.streak}
              storyCount={safeUserStories.length} // Pass the user's story count
            />

            {/* Always show + button to add story */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddNewStory}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {Object.entries(groupedStories).map(([userId, userStoryGroup]) => {
          const latestStory = userStoryGroup[0];
          if (!latestStory?.user) return null;

          const allStoriesViewed = userStoryGroup.every(story => story.viewed);

          return (
            <View key={userId} style={styles.otherStoryContainer}>
              <StoryCircle
                imageUrl={latestStory.user.avatar}
                name={latestStory.user.name?.split(' ')[0] || 'User'}
                viewed={allStoriesViewed}
                hasStories={true}
                onPress={() => handleOtherUserStoryPress(latestStory)}
                streak={latestStory.user.streak}
                storyCount={userStoryGroup.length} // Pass the other user's story count
              />
            </View>
          );
        })}

        {Object.keys(groupedStories).length === 0 && safeUserStories.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              Be the first to share a story!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  userStoryWrapper: {
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  addButton: {
    position: 'absolute',
    bottom: 22,
    right: 0,
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: Colors.dark.background,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherStoryContainer: {
    marginHorizontal: 6,
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginLeft: 20,
  },
  emptyStateText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default StoriesSection;