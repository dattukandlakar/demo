import * as FileSystem from 'expo-file-system';

interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

const API_BASE = 'https://social-backend-y1rg.onrender.com';

/**
 * Enhanced upload function with better video support
 */
export const uploadMediaBase64 = async (
  uri: string,
  token: string,
  mediaType: 'image' | 'video',
  onProgress?: (progress: number) => void,
  options?: {
    fileName?: string;
    mimeType?: string;
  }
): Promise<UploadResult> => {
  try {

    // Validate inputs
    if (!uri || typeof uri !== 'string' || uri.trim() === '') {
      throw new Error('Invalid media URI: URI is empty or invalid');
    }

    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Invalid token: Token is empty or invalid');
    }

    // Normalize URI - ensure proper file:// prefix for videos
    let normalizedUri = uri;
    if (mediaType === 'video' && !uri.startsWith('file://') && uri.startsWith('/')) {
      normalizedUri = `file://${uri}`;
      // console.log('📹 Normalized video URI:', normalizedUri);
    }

    // Verify the file exists
    const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
    if (!fileInfo.exists) {
      console.error('❌ File does not exist at:', normalizedUri);
      throw new Error('Media file does not exist');
    }

    // console.log('📁 File info:', { 
    //   size: fileInfo.size, 
    //   exists: fileInfo.exists,
    //   uri: normalizedUri 
    // });

    // Enhanced size checking with base64 consideration
    const maxSize = mediaType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image
    const base64MaxSize = Math.floor(maxSize * 0.75); // Account for 33% base64 overhead
    
    if (fileInfo.size && fileInfo.size > maxSize) {
      throw new Error(`File too large: ${Math.round(fileInfo.size / 1024 / 1024)}MB. Max allowed: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // For large files, skip base64 and go directly to FormData
    if (fileInfo.size && fileInfo.size > base64MaxSize) {
      // console.log(`📊 File size (${Math.round(fileInfo.size / 1024 / 1024)}MB) too large for base64, using FormData directly...`);
      return await uploadMediaFormData(normalizedUri, token, mediaType, onProgress, options);
    }

    // Read file as base64
    if (onProgress) onProgress(10);
    // console.log('📖 Reading file as base64...');
    
    const base64 = await FileSystem.readAsStringAsync(normalizedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64 || base64.length === 0) {
      throw new Error('Failed to read file as base64 or file is empty');
    }

    if (onProgress) onProgress(30);
    // console.log('✅ File read successfully, base64 size:', base64.length);

    // Final size check after base64 encoding
    const estimatedPayloadSize = base64.length + 1000; // Add some buffer for metadata
    const maxPayloadSize = 50 * 1024 * 1024; // 50MB reasonable limit for most servers
    
    if (estimatedPayloadSize > maxPayloadSize) {
      // console.log(`📊 Base64 payload too large (${Math.round(estimatedPayloadSize / 1024 / 1024)}MB), switching to FormData...`);
      return await uploadMediaFormData(normalizedUri, token, mediaType, onProgress, options);
    }

    // Determine MIME type and filename with better video support
    let mimeType = options?.mimeType || '';
    let fileName = options?.fileName || '';
    
    if (!mimeType || !fileName) {
      const fileDetails = getFileDetails(normalizedUri, mediaType);
      mimeType = mimeType || fileDetails.mimeType;
      fileName = fileName || fileDetails.fileName;
    }

    // console.log('📋 File details determined:', { fileName, mimeType, mediaType });

    // Create data URI
    const dataUri = `data:${mimeType};base64,${base64}`;
    
    if (onProgress) onProgress(50);

    // Enhanced payload with better video metadata
    const payload = {
      mediaData: dataUri,
      fileName: fileName,
      mimeType: mimeType,
      mediaType: mediaType,
      fileSize: fileInfo.size || base64.length,
      timestamp: Date.now(),
    };

    // console.log('📤 Sending enhanced base64 upload request...', {
    //   fileName,
    //   mimeType,
    //   mediaType,
    //   dataSize: base64.length,
    //   fileSize: fileInfo.size,
    //   payloadSize: `${Math.round(JSON.stringify(payload).length / 1024 / 1024 * 100) / 100}MB`
    // });

    const response = await fetch(`${API_BASE}/user/upload/story/base64`, {
      method: 'POST',
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (onProgress) onProgress(90);

    // console.log('📥 Server response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload error response:', errorText);
      
      // Handle specific error cases more gracefully
      if (response.status === 413) {
        // console.log('📊 Payload too large (413), switching to FormData method...');
        return await uploadMediaFormData(normalizedUri, token, mediaType, onProgress, options);
      }
      
      if (response.status === 404) {
        // console.log('🔄 Base64 endpoint not found (404), falling back to FormData method...');
        return await uploadMediaFormData(normalizedUri, token, mediaType, onProgress, options);
      }
      
      // For other errors, try to parse JSON error response
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch {
        // Keep the original error text if it's not JSON
      }
      
      throw new Error(errorMessage || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    if (onProgress) onProgress(100);
    
    // console.log('✅ Enhanced base64 upload successful:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Enhanced base64 upload error:', error);
    
    // Only fallback to FormData if we haven't already tried it
    if (error instanceof Error && !error.message.includes('FormData')) {
      // console.log('🔄 Base64 upload failed, trying FormData method...');
      try {
        return await uploadMediaFormData(uri, token, mediaType, onProgress, options);
      } catch (fallbackError) {
        console.error('❌ All upload methods failed:', fallbackError);
        return { 
          success: false, 
          error: `Both upload methods failed. Base64: ${error.message}. FormData: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}` 
        };
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
};

// Helper function to intelligently choose upload method
export const uploadMediaSmart = async (
  uri: string,
  token: string,
  mediaType: 'image' | 'video',
  onProgress?: (progress: number) => void,
  options?: {
    fileName?: string;
    mimeType?: string;
    preferredMethod?: 'base64' | 'formdata' | 'auto';
  }
): Promise<UploadResult> => {
  const preferredMethod = options?.preferredMethod || 'auto';
  
  // Get file info for smart decision making
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    return { success: false, error: 'File does not exist' };
  }
  
  const fileSizeMB = fileInfo.size ? fileInfo.size / 1024 / 1024 : 0;
  
  // Smart method selection
  let useBase64 = false;
  
  if (preferredMethod === 'base64') {
    useBase64 = true;
  } else if (preferredMethod === 'formdata') {
    useBase64 = false;
  } else { // auto
    // Use base64 for smaller files, FormData for larger ones
    const base64Threshold = mediaType === 'image' ? 5 : 30; // MB
    useBase64 = fileSizeMB < base64Threshold;
  }
  
  // console.log(`🧠 Smart upload decision: ${useBase64 ? 'Base64' : 'FormData'} (file: ${fileSizeMB.toFixed(2)}MB, type: ${mediaType})`);
  
  if (useBase64) {
    return await uploadMediaBase64(uri, token, mediaType, onProgress, options);
  } else {
    return await uploadMediaFormData(uri, token, mediaType, onProgress, options);
  }
};

/**
 * Enhanced FormData upload with better video support
 */
export const uploadMediaFormData = async (
  uri: string,
  token: string,
  mediaType: 'image' | 'video',
  onProgress?: (progress: number) => void,
  options?: {
    fileName?: string;
    mimeType?: string;
  }
): Promise<UploadResult> => {
  try {
    // console.log('🔄 Starting FormData upload method...', { uri, mediaType, options });

    // Validate inputs
    if (!uri || !token) {
      throw new Error('Invalid URI or token');
    }

    // Normalize URI for videos
    let normalizedUri = uri;
    if (mediaType === 'video' && !uri.startsWith('file://') && uri.startsWith('/')) {
      normalizedUri = `file://${uri}`;
      // console.log('📹 Normalized video URI for FormData:', normalizedUri);
    }

    // Verify file exists
    const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
    if (!fileInfo.exists) {
      throw new Error('Media file does not exist');
    }

    if (onProgress) onProgress(20);

    // Get file details
    const fileDetails = getFileDetails(normalizedUri, mediaType);
    const fileName = options?.fileName || fileDetails.fileName;
    const mimeType = options?.mimeType || fileDetails.mimeType;

    // console.log('📋 FormData file details:', { fileName, mimeType, fileSize: fileInfo.size });

    // Create FormData
    const formData = new FormData();
    
    // Add the media file with proper metadata
    formData.append('media', {
      uri: normalizedUri,
      type: mimeType,
      name: fileName,
    } as any);

    // Add additional fields
    formData.append('mediaType', mediaType);
    formData.append('fileName', fileName);
    formData.append('mimeType', mimeType);
    
    if (fileInfo.size) {
      formData.append('fileSize', fileInfo.size.toString());
    }

    if (onProgress) onProgress(50);

    // console.log('📤 Sending FormData upload request...');

    const response = await fetch(`${API_BASE}/user/upload/story`, {
      method: 'POST',
      headers: {
        'token': token,
        // Note: Don't set Content-Type for FormData, let the browser set it
      },
      body: formData,
    });

    if (onProgress) onProgress(90);

    // console.log('📥 FormData response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FormData upload error:', errorText);
      throw new Error(errorText || `FormData upload failed with status ${response.status}`);
    }

    const result = await response.json();
    if (onProgress) onProgress(100);
    
    // console.log('✅ FormData upload successful:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('FormData upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'FormData upload failed' 
    };
  }
};

/**
 * Get file details with enhanced video support
 */
function getFileDetails(uri: string, mediaType: 'image' | 'video') {
  const timestamp = Date.now();
  
  // Extract file extension
  const uriParts = uri.split('.');
  const fileExtension = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase() : '';

  if (mediaType === 'image') {
    switch (fileExtension) {
      case 'png':
        return {
          mimeType: 'image/png',
          fileName: `story_image_${timestamp}.png`,
        };
      case 'heic':
      case 'heif':
        return {
          mimeType: 'image/heic',
          fileName: `story_image_${timestamp}.heic`,
        };
      case 'webp':
        return {
          mimeType: 'image/webp',
          fileName: `story_image_${timestamp}.webp`,
        };
      default:
        return {
          mimeType: 'image/jpeg',
          fileName: `story_image_${timestamp}.jpg`,
        };
    }
  } else {
    // Enhanced video type detection
    switch (fileExtension) {
      case 'mov':
        return {
          mimeType: 'video/quicktime',
          fileName: `story_video_${timestamp}.mov`,
        };
      case 'avi':
        return {
          mimeType: 'video/x-msvideo',
          fileName: `story_video_${timestamp}.avi`,
        };
      case 'mkv':
        return {
          mimeType: 'video/x-matroska',
          fileName: `story_video_${timestamp}.mkv`,
        };
      case 'webm':
        return {
          mimeType: 'video/webm',
          fileName: `story_video_${timestamp}.webm`,
        };
      case '3gp':
        return {
          mimeType: 'video/3gpp',
          fileName: `story_video_${timestamp}.3gp`,
        };
      default:
        // Default to MP4 for unknown video formats
        return {
          mimeType: 'video/mp4',
          fileName: `story_video_${timestamp}.mp4`,
        };
    }
  }
}

/**
 * Debug function to help troubleshoot upload issues
 */
export const debugUploadContext = async (uri: string, token: string, mediaType: 'image' | 'video') => {
  const debug = {
    uri,
    mediaType,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    fileExists: false,
    fileSize: 0,
    isVideo: mediaType === 'video',
    normalizedUri: uri,
  };

  try {
    // Normalize URI for videos
    if (mediaType === 'video' && !uri.startsWith('file://') && uri.startsWith('/')) {
      debug.normalizedUri = `file://${uri}`;
    }

    const fileInfo = await FileSystem.getInfoAsync(debug.normalizedUri);
    debug.fileExists = fileInfo.exists;
    debug.fileSize = fileInfo.size || 0;

    // Get file details
    const fileDetails = getFileDetails(debug.normalizedUri, mediaType);
    return {
      ...debug,
      ...fileDetails,
    };
  } catch (error) {
    console.error('Debug context error:', error);
    return {
      ...debug,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const logUploadDebugInfo = (debugInfo: any, mediaType: string) => {
  // console.log(`🔍 DEBUG INFO for ${mediaType.toUpperCase()}:`, {
  //   uri: debugInfo.uri,
  //   normalizedUri: debugInfo.normalizedUri,
  //   fileExists: debugInfo.fileExists,
  //   fileSize: debugInfo.fileSize ? `${Math.round(debugInfo.fileSize / 1024)}KB` : 'Unknown',
  //   fileName: debugInfo.fileName,
  //   mimeType: debugInfo.mimeType,
  //   hasToken: debugInfo.hasToken,
  //   tokenLength: debugInfo.tokenLength,
  // });
};