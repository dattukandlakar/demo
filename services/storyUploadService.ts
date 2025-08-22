import { compressStoryImage } from '@/utils/mediaCompression';

const API_BASE = 'https://social-backend-y1rg.onrender.com';

export interface StoryUploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface StoryUploadProgress {
  (progress: number): void;
}

/**
 * Optimized story upload function that consolidates all upload methods
 * Automatically compresses media and handles different file types
 */
export async function uploadStory(
  token: string,
  mediaUri: string,
  mediaType: 'image' | 'video',
  onProgress?: StoryUploadProgress
): Promise<StoryUploadResult> {
  try {
    if (!mediaUri || !token) {
      throw new Error('Missing required parameters: mediaUri and token');
    }

    onProgress?.(10);

    // Compress image if it's an image type
    let finalMediaUri = mediaUri;
    if (mediaType === 'image') {
      try {
        const compressed = await compressStoryImage(mediaUri);
        finalMediaUri = compressed.uri;
        onProgress?.(30);
      } catch (compressionError) {
        console.warn('Compression failed, using original image:', compressionError);
        onProgress?.(30);
      }
    } else {
      onProgress?.(30);
    }

    // Create FormData for upload
    const formData = new FormData();
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = getFileExtension(finalMediaUri, mediaType);
    const fileName = `story_${timestamp}.${fileExtension}`;
    
    // Get appropriate MIME type
    const mimeType = getMimeType(mediaType, fileExtension);
    
    // Create file object
    const fileObject = {
      uri: finalMediaUri,
      type: mimeType,
      name: fileName,
    };

    // Append file to FormData - using 'file' as the field name for consistency
    formData.append('file', fileObject as any);
    
    onProgress?.(50);

    // Make the upload request
    const response = await fetch(`${API_BASE}/user/upload/story`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'token': token, // Some endpoints might expect both
        'Accept': 'application/json',
      },
      body: formData,
    });

    onProgress?.(80);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    onProgress?.(100);

    return {
      success: true,
      data: result
    };

  } catch (error: any) {
    console.error('Story upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

/**
 * Get file extension from URI or default based on media type
 */
function getFileExtension(uri: string, mediaType: 'image' | 'video'): string {
  try {
    const uriParts = uri.split('.');
    if (uriParts.length > 1) {
      return uriParts[uriParts.length - 1].toLowerCase();
    }
  } catch (error) {
    console.warn('Could not extract file extension from URI:', uri);
  }
  
  // Default extensions
  return mediaType === 'image' ? 'jpg' : 'mp4';
}

/**
 * Get appropriate MIME type based on media type and file extension
 */
function getMimeType(mediaType: 'image' | 'video', fileExtension: string): string {
  if (mediaType === 'image') {
    switch (fileExtension.toLowerCase()) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'heic':
        return 'image/heic';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  } else {
    switch (fileExtension.toLowerCase()) {
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';
      case 'm4v':
        return 'video/x-m4v';
      case 'webm':
        return 'video/webm';
      default:
        return 'video/mp4';
    }
  }
}

/**
 * Upload story with retry mechanism for better reliability
 */
export async function uploadStoryWithRetry(
  token: string,
  mediaUri: string,
  mediaType: 'image' | 'video',
  onProgress?: StoryUploadProgress,
  maxRetries: number = 2
): Promise<StoryUploadResult> {
  let lastError: string = '';
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await uploadStory(token, mediaUri, mediaType, onProgress);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error || 'Unknown error';
    
    if (attempt < maxRetries) {
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return {
    success: false,
    error: `Upload failed after ${maxRetries + 1} attempts. Last error: ${lastError}`
  };
}
