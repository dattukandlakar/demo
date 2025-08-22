import * as ImageManipulator from 'expo-image-manipulator';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Platform } from 'react-native';

export interface CompressedMedia {
  uri: string;
  width: number;
  height: number;
  size?: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png';
}

// Default compression settings optimized for social media
const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1080,
  maxHeight: 1920,
  quality: 0.8,
  format: 'jpeg'
};

/**
 * Compress image for optimal performance and storage
 */
export async function compressImage(
  uri: string, 
  options: CompressionOptions = {}
): Promise<CompressedMedia> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Use react-native-image-resizer for better performance on native
      const result = await ImageResizer.createResizedImage(
        uri,
        config.maxWidth!,
        config.maxHeight!,
        config.format!.toUpperCase() as any,
        config.quality! * 100,
        0,
        undefined,
        false,
        { onlyScaleDown: true }
      );
      
      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: result.size
      };
    } else {
      // Fallback to expo-image-manipulator for web
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: config.maxWidth, height: config.maxHeight } }
        ],
        {
          compress: config.quality,
          format: config.format === 'jpeg' ? 
            ImageManipulator.SaveFormat.JPEG : 
            ImageManipulator.SaveFormat.PNG
        }
      );
      
      return {
        uri: result.uri,
        width: result.width,
        height: result.height
      };
    }
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    // Return original if compression fails
    return { uri, width: 0, height: 0 };
  }
}

/**
 * Compress image specifically for story uploads (9:16 aspect ratio)
 */
export async function compressStoryImage(uri: string): Promise<CompressedMedia> {
  return compressImage(uri, {
    maxWidth: 1080,
    maxHeight: 1920,
    quality: 0.85,
    format: 'jpeg'
  });
}

/**
 * Compress image for post uploads (flexible aspect ratio)
 */
export async function compressPostImage(uri: string): Promise<CompressedMedia> {
  return compressImage(uri, {
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg'
  });
}

/**
 * Compress profile images (square, smaller size)
 */
export async function compressProfileImage(uri: string): Promise<CompressedMedia> {
  return compressImage(uri, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
    format: 'jpeg'
  });
}

/**
 * Get optimal compression settings based on file size
 */
export function getCompressionSettings(fileSizeBytes: number): CompressionOptions {
  if (fileSizeBytes > 10 * 1024 * 1024) { // > 10MB
    return { maxWidth: 720, maxHeight: 1280, quality: 0.6 };
  } else if (fileSizeBytes > 5 * 1024 * 1024) { // > 5MB
    return { maxWidth: 1080, maxHeight: 1920, quality: 0.7 };
  } else if (fileSizeBytes > 2 * 1024 * 1024) { // > 2MB
    return { maxWidth: 1080, maxHeight: 1920, quality: 0.8 };
  } else {
    return DEFAULT_OPTIONS; // Use default for smaller files
  }
}

/**
 * Check if media needs compression
 */
export function shouldCompressMedia(fileSizeBytes?: number, width?: number, height?: number): boolean {
  if (fileSizeBytes && fileSizeBytes > 1024 * 1024) { // > 1MB
    return true;
  }
  if (width && height && (width > 1920 || height > 1920)) {
    return true;
  }
  return false;
}
