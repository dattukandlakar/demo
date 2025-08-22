import { Story } from '@/types';

export function mapStoryFromApi(apiStory: any, user?: any): Story {
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
    viewed: false, // Default to false for user's own stories
    __v: apiStory.__v,
  };
}

export function mapStoriesFromApi(apiStories: any[], user?: any): Story[] {
  if (!Array.isArray(apiStories)) {
    return [];
  }

  return apiStories
    .filter((story: any) => story && story._id) // Filter out invalid stories
    .map((story: any) => mapStoryFromApi(story, user));
} 