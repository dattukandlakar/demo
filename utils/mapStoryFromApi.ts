import { Story } from '@/types';

export function mapStoryFromApi(apiStory, user) {
  return {
    id: apiStory._id || `story_${Date.now()}_${Math.random()}`,
    _id: apiStory._id,
    user: user || { id: 'unknown', name: 'Unknown User', avatar: '' },
    image: apiStory.url,
    url: apiStory.url,
    type: apiStory.type || 'image',
    userId: apiStory.userId,
    createdAt: apiStory.createdAt || new Date().toISOString(),
    updatedAt: apiStory.updatedAt,
    viewed: false,
    __v: apiStory.__v,
    source: apiStory.source,
    overlayData: apiStory.overlayData || null, // Ensure overlayData is included
    caption: apiStory.caption || '', // Include caption if available
  };
}

export function mapStoriesFromApi(apiStories, user) {
  if (!Array.isArray(apiStories)) {
    return [];
  }

  return apiStories
    .filter((story) => story && story._id)
    .map((story) => mapStoryFromApi(story, user));
}