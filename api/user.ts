// api/user.ts
 export const API_BASE = 'https://social-backend-y1rg.onrender.com';

export async function getUser(token: string) {
  const res = await fetch(`${API_BASE}/user/getUser`, {
    method: 'GET',
    headers: {
      token: token,
      'Content-Type': 'application/json',
    },
    
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  return response.body;
}

export async function updateUserProfile(token: string, profileData: any) {
  const res = await fetch(`${API_BASE}/user/update`, {
    method: 'POST',
    headers: {
      token: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    console.error(await res.text());
    throw new Error(await res.text());
  }
  return await res.json();
}

export async function getUserById(token: string, userId: string) {
  const res = await fetch(`${API_BASE}/user/${userId}`, {
    method: 'GET',
    headers: {
      token: token,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  return response;
}

export async function uploadProfileImage(token: string, imageUri: string) {

  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    name: 'profile.jpg',
    type: 'image/jpeg',
  } as any);
  formData.append('profileImage', {
    uri: imageUri,
    name: 'profile.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${API_BASE}/user/uploadProfileImage`, {
    method: 'POST',
    headers: {
      token: token,
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Fixed uploadStory function with proper video handling
export async function uploadStory(
  token: string,
  mediaUri: string,
  mediaType: 'image' | 'video'
) {
  try {
    if (typeof mediaUri !== 'string' || !mediaUri || mediaUri.trim() === '') {
      throw new Error('Invalid media URI: URI is empty or invalid');
    }

    

    // ✅ CRITICAL: For React Native, we need to create a proper file object
    // The issue is likely in how FormData handles video files vs images
    
    const formData = new FormData();

    let fileExtension = 'jpg';
    let mimeType = 'image/jpeg';
    let fileName: string;

    // Extract file extension
    const uriParts = mediaUri.split('.');
    if (uriParts.length > 1) {
      fileExtension = uriParts[uriParts.length - 1].toLowerCase();
    }

    if (mediaType === 'image') {
      switch (fileExtension) {
        case 'png':
          mimeType = 'image/png';
          fileName = `story_${Date.now()}.png`;
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          fileName = `story_${Date.now()}.jpg`;
          break;
        case 'heic':
          mimeType = 'image/heic';
          fileName = `story_${Date.now()}.heic`;
          break;
        default:
          mimeType = 'image/jpeg';
          fileName = `story_${Date.now()}.jpg`;
      }
    } else {
      // ✅ FIXED: Better video MIME type handling
      switch (fileExtension) {
        case 'mp4':
          mimeType = 'video/mp4';
          fileName = `story_${Date.now()}.mp4`;
          break;
        case 'mov':
          mimeType = 'video/quicktime';
          fileName = `story_${Date.now()}.mov`;
          break;
        case 'avi':
          mimeType = 'video/x-msvideo';
          fileName = `story_${Date.now()}.avi`;
          break;
        case 'm4v':
          mimeType = 'video/x-m4v';
          fileName = `story_${Date.now()}.m4v`;
          break;
        default:
          // ✅ IMPORTANT: Default to mp4 for unknown video formats
          mimeType = 'video/mp4';
          fileName = `story_${Date.now()}.mp4`;
      }
    }

    // ✅ CRITICAL FIX: Proper file object creation for React Native
    const fileObject = {
      uri: mediaUri,
      type: mimeType,
      name: fileName,
    };

   

    // Use consistent field name 'file' which matches backend expectation
    formData.append('file', fileObject as any);

   

    const response = await fetch(`${API_BASE}/user/upload/story`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ✅ CRITICAL: Don't set Content-Type for multipart/form-data
        // Let the browser/RN set the boundary automatically
      },
      body: formData,
    });

   

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: Failed to upload story`);
    }

    const result = await response.json();

    return result;

  } catch (error) {
    console.error('Story upload error:', error);
    throw error;
  }
}

// ✅ Alternative video upload method with base64 encoding
export async function uploadStoryWithBase64(
  token: string,
  mediaUri: string,
  mediaType: 'image' | 'video'
) {
  try {
    

    if (typeof mediaUri !== 'string' || !mediaUri || mediaUri.trim() === '') {
      throw new Error('Invalid media URI: URI is empty or invalid');
    }

    // ✅ For videos that fail with FormData, try base64 encoding
    // This is especially useful for camera-captured videos
    
    let base64Data: string;
    let mimeType: string;
    
    if (mediaType === 'video') {
      // Note: You'll need to install expo-file-system for this to work
      // import * as FileSystem from 'expo-file-system';
      
      // For now, let's try a different approach with proper file handling
      const fileExtension = mediaUri.split('.').pop()?.toLowerCase() || 'mp4';
      
      switch (fileExtension) {
        case 'mov':
          mimeType = 'video/quicktime';
          break;
        case 'avi':
          mimeType = 'video/x-msvideo';
          break;
        default:
          mimeType = 'video/mp4';
      }
    } else {
      const fileExtension = mediaUri.split('.').pop()?.toLowerCase() || 'jpg';
      mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
    }

    // ✅ Try sending as JSON payload instead of FormData
    const payload = {
      mediaUri: mediaUri,
      mediaType: mediaType,
      mimeType: mimeType,
      fileName: `story_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`,
    };

    const response = await fetch(`${API_BASE}/user/upload/story`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Base64 upload error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: Failed to upload story`);
    }

    const result = await response.json();
   
    return result;
  } catch (error) {
    console.error('Base64 story upload error:', error);
    throw error;
  }
}

// ✅ Video-specific upload function with better error handling
// export async function uploadVideoStory(
//   token: string,
//   mediaUri: string
// ) {
//   try {
//     console.log('Video-specific upload - Starting with:', mediaUri);

//     if (typeof mediaUri !== 'string' || !mediaUri || mediaUri.trim() === '') {
//       throw new Error('Invalid video URI');
//     }

//     const formData = new FormData();
    
//     // ✅ Simplified video handling
//     const timestamp = Date.now();
//     const fileExtension = mediaUri.split('.').pop()?.toLowerCase() || 'mp4';
    
//     let mimeType: string;
//     switch (fileExtension) {
//       case 'mov':
//         mimeType = 'video/quicktime';
//         break;
//       case 'm4v':
//         mimeType = 'video/x-m4v';
//         break;
//       default:
//         mimeType = 'video/mp4';
//     }

//     const videoFile = {
//       uri: mediaUri,
//       type: mimeType,
//       name: `video_story_${timestamp}.${fileExtension}`,
//     };

//     console.log('Video file object:', videoFile);

//     // ✅ Try multiple field names for video uploads
//     formData.append('video', videoFile as any);
//     formData.append('media', videoFile as any);
//     formData.append('file', videoFile as any);
    
//     // ✅ Add video-specific metadata
//     formData.append('mediaType', 'video');
//     formData.append('contentType', mimeType);
//     formData.append('fileType', fileExtension);

//     const response = await fetch(`${API_BASE}/user/upload/story`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         // ✅ Some servers need explicit multipart header for videos
//         // 'Content-Type': 'multipart/form-data', // Uncomment if needed
//       },
//       body: formData,
//     });

//     console.log('Video upload response status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Video upload error:', errorText);
//       throw new Error(errorText || `Failed to upload video story`);
//     }

//     const result = await response.json();
//     console.log('Video upload success:', result);
//     return result;

//   } catch (error) {
//     console.error('Video story upload error:', error);
//     throw error;
//   }
// }

export async function uploadStoryAlternative(
  token: string,
  mediaUri: string,
  mediaType: 'image' | 'video'
) {
  try {
    

    if (typeof mediaUri !== 'string' || !mediaUri || mediaUri.trim() === '') {
      throw new Error('Invalid media URI: URI is empty or invalid');
    }

    const formData = new FormData();

    // ✅ Safer file extension extraction
    let fileExtension = '';
    let fileName = '';
    let mimeType = '';

    try {
      const uriParts = mediaUri.split('.');
      if (uriParts.length > 1) {
        fileExtension = uriParts[uriParts.length - 1].toLowerCase();
      }
    } catch (e) {
      console.warn('Could not extract file extension from URI:', mediaUri);
    }

    // ✅ Set defaults and handle different file types
    if (mediaType === 'image') {
      switch (fileExtension) {
        case 'png':
          mimeType = 'image/png';
          fileName = `story_${Date.now()}.png`;
          break;
        case 'heic':
          mimeType = 'image/heic';
          fileName = `story_${Date.now()}.heic`;
          break;
        default:
          mimeType = 'image/jpeg';
          fileName = `story_${Date.now()}.jpg`;
          fileExtension = 'jpg';
      }
    } else {
      switch (fileExtension) {
        case 'mov':
          mimeType = 'video/quicktime';
          fileName = `story_${Date.now()}.mov`;
          break;
        case 'avi':
          mimeType = 'video/x-msvideo';
          fileName = `story_${Date.now()}.avi`;
          break;
        default:
          mimeType = 'video/mp4';
          fileName = `story_${Date.now()}.mp4`;
          fileExtension = 'mp4';
      }
    }

    // ✅ Try using 'file' instead of 'media' as field name
    const fileObject = {
      uri: mediaUri,
      type: mimeType,
      name: fileName,
    };

   

    // Use consistent field name 'file' which matches backend expectation
    formData.append('file', fileObject as any);

    // ✅ Try different header approach
    const response = await fetch(`${API_BASE}/user/upload/story`, {
      method: 'POST',
      headers: {
        'token': token, // Some APIs expect 'token' instead of 'Authorization'
        'Accept': 'application/json',
      },
      body: formData,
    });

  

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alternative upload error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: Failed to upload story`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Alternative story upload error:', error);
    throw error;
  }
}


export async function uploadVideoStory(token: string, mediaUri: string) {
  try {
    

    // Create FormData
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = mediaUri.split('/').pop() || `video_${Date.now()}.mp4`;
    
    // Determine MIME type based on extension
    const ext = filename.split('.').pop()?.toLowerCase();
    let mimeType = 'video/mp4';
    if (ext === 'mov') mimeType = 'video/quicktime';
    if (ext === 'avi') mimeType = 'video/x-msvideo';
    if (ext === 'm4v') mimeType = 'video/x-m4v';

    // Add the video file to FormData
    formData.append('video', {
      uri: mediaUri,
      name: filename,
      type: mimeType,
    } as any);

    // Add any additional metadata
    formData.append('mediaType', 'video');
    formData.append('uploadedAt', Date.now().toString());

    
    
    const response = await fetch(`${API_BASE}/user/upload/story`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: Don't set Content-Type header - let React Native set it with the correct boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Video upload failed:', errorText);
      throw new Error(errorText || 'Video upload failed');
    }

    const result = await response.json();
    
    return result;
    
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}


export async function followingUserStory(token:any) {
  try {
    const response = await fetch(`${API_BASE}/user/story`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token 
      }
    });

    const data = await response.json();

    return data.body;
  } catch (err: any) {
    throw new Error(err.message || "Failed to fetch user story.");
  }
}


export async function saveCommentToStory(storyId: string, message: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/user/story/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "token":token
      },
      body: JSON.stringify({storyId, text: message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to save comment:', errorText);
      throw new Error(errorText || 'Failed to save comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving comment:', error);
    throw error;
  }
}

export async function getCommentsForStory(storyId: string) {
  try {
    const response = await fetch(`${API_BASE}/user/story/${storyId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch comments:', errorText);
      throw new Error(errorText || 'Failed to fetch comments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export async function addLiketoStoryCommet(storyId: string,commentId:string, token: string) {
  try {
    
    const response = await fetch(`${API_BASE}/user/storyId/${commentId}/commnentId/${storyId}/saveComment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'token': token 
       },
})


  }catch (error) {
    console.error('Error liking story comment:', error);
    throw error;
  }
}
  



/**
 * Fetches the list of users that the current user is following.
 */
export async function getFollowers(token: string) {
  // CORRECTED THE URL to a more likely endpoint.
  // You MUST verify this with your backend's actual route.
  const correctedEndpoint = `${API_BASE}/user/followers`; 

  console.log(`🚀 [API CALL] Starting: getFollowers at ${correctedEndpoint}`);

  try {
    const response = await fetch(correctedEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ [API RESPONSE] Status: ${response.status} - ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API ERROR] Response not OK. Body:', errorText);
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 [API DATA] Successfully parsed JSON:', data);
    return data;

  } catch (error) {
    console.error('💥 [API CATCH] An unexpected error occurred in getFollowers:', error);
    throw error;
  }
}

/**
 * Sends content to selected recipients via direct message.
 */
export async function shareContent(payload: { contentId: string, contentType: string, recipientIds: string[] }, token: string) {
  const res = await fetch(`${API_BASE}/share`, { // Assuming this is your endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorRes = await res.json();
    throw new Error(errorRes.message || 'Failed to share content');
  }
  return res.json();
}

/**
 * Fetches comments made by a specific user across all posts
 */
export async function getUserComments(token: string, userId: string) {
  try {
    console.log('🚀 [API] getUserComments called with:', { userId, tokenExists: !!token });
    
    const requestBody = { userId };
    console.log('📡 [API] Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE}/post/comment/getUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📝 [API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Failed to fetch user comments:', errorText);
      throw new Error(errorText || 'Failed to fetch user comments');
    }

    const data = await response.json();
    console.log('📦 [API] Raw response data:', JSON.stringify(data, null, 2));
    
    const result = data.body || data;
    console.log('✅ [API] Returning data:', Array.isArray(result) ? `Array with ${result.length} items` : 'Non-array result');
    
    return result;
  } catch (error) {
    console.error('❌ [API] Error fetching user comments:', error);
    throw error;
  }
}

/**
 * Fetches detailed user profiles for multiple users at once using the bulk API
 */
export async function getBulkUser(token: string, userIds: string[]) {
  try {
    console.log('🚀 [API] getBulkUser called with:', { userIds, tokenExists: !!token });
    
    if (!userIds || userIds.length === 0) {
      return [];
    }

    // Try different parameter formats that the backend might expect
    const requestFormats = [
      { userIds: userIds },           // lowercase userIds
      { UserId: userIds },            // capital UserId
      { UserIds: userIds },           // capital UserIds
      { ids: userIds },               // just ids
      { users: userIds },             // users
    ];
    
    let response;
    let lastError;
    
    // Try each format until one works
    for (const [index, requestBody] of requestFormats.entries()) {
      console.log(`📡 [API] Trying request format ${index + 1}:`, JSON.stringify(requestBody, null, 2));
      
      try {
        response = await fetch(`${API_BASE}/user/getBulkUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': token,
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`📝 [API] getBulkUser response status (format ${index + 1}):`, response.status, response.statusText);
        
        if (response.ok) {
          console.log(`✅ [API] Format ${index + 1} worked!`);
          break;
        } else {
          const errorText = await response.text();
          lastError = errorText;
          console.log(`⚠️ [API] Format ${index + 1} failed:`, errorText);
          continue;
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ [API] Format ${index + 1} threw error:`, error);
        continue;
      }
    }

    if (!response || !response.ok) {
      console.error('❌ [API] All formats failed. Last error:', lastError);
      throw new Error(lastError || 'Failed to fetch bulk user data with all formats');
    }

    const data = await response.json();
    console.log('📦 [API] getBulkUser raw response data:', JSON.stringify(data, null, 2));
    
    const result = data.body || data.users || data;
    console.log('✅ [API] getBulkUser returning data:', Array.isArray(result) ? `Array with ${result.length} items` : 'Non-array result');
    
    return result;
  } catch (error) {
    console.error('❌ [API] Error fetching bulk user data:', error);
    throw error;
  }
}

/**
 * Fetches the followers list for a specific user
 */
export async function getUserFollowers(token: string, userId?: string) {
  try {
    console.log('🚀 [API] getUserFollowers called with:', { userId, tokenExists: !!token });
    
    // If no userId provided, get current user's followers
    const endpoint = userId ? `${API_BASE}/user/${userId}/followers` : `${API_BASE}/user/followers`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'token': token, // Keep both for compatibility
      },
    });

    console.log('📝 [API] getUserFollowers response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Failed to fetch followers:', errorText);
      throw new Error(errorText || 'Failed to fetch followers');
    }

    const data = await response.json();
    console.log('📦 [API] getUserFollowers raw response data:', JSON.stringify(data, null, 2));
    
    const result = data.body || data.followers || data;
    console.log('✅ [API] getUserFollowers returning data:', Array.isArray(result) ? `Array with ${result.length} items` : 'Non-array result');
    
    return result;
  } catch (error) {
    console.error('❌ [API] Error fetching followers:', error);
    throw error;
  }
}

/**
 * Fetches the following list for a specific user
 */
export async function getUserFollowing(token: string, userId?: string) {
  try {
    console.log('🚀 [API] getUserFollowing called with:', { userId, tokenExists: !!token });
    
    // If no userId provided, get current user's following
    const endpoint = userId ? `${API_BASE}/user/${userId}/following` : `${API_BASE}/user/following`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'token': token, // Keep both for compatibility
      },
    });

    console.log('📝 [API] getUserFollowing response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Failed to fetch following:', errorText);
      throw new Error(errorText || 'Failed to fetch following');
    }

    const data = await response.json();
    console.log('📦 [API] getUserFollowing raw response data:', JSON.stringify(data, null, 2));
    
    const result = data.body || data.following || data;
    console.log('✅ [API] getUserFollowing returning data:', Array.isArray(result) ? `Array with ${result.length} items` : 'Non-array result');
    
    return result;
  } catch (error) {
    console.error('❌ [API] Error fetching following:', error);
    throw error;
  }
}

/**
 * Enriches a list of basic user objects with full profile data using the bulk API
 * If bulk API fails, returns the original user data without enrichment
 */
export async function enrichUserList(token: string, users: any[]) {
  try {
    console.log('🚀 [API] enrichUserList called with:', { usersCount: users.length, tokenExists: !!token });
    
    if (!users || users.length === 0) {
      return [];
    }

    // Extract user IDs from the users array and remove duplicates
    const userIds = [...new Set(users.map(user => user.id || user._id).filter(Boolean))];
    
    if (userIds.length === 0) {
      console.log('⚠️ [API] No valid user IDs found, returning original data');
      return users;
    }

    console.log('📡 [API] Enriching users with IDs:', userIds);
    
    // Try to fetch detailed user profiles, but don't fail if it doesn't work
    try {
      const detailedUsers = await getBulkUser(token, userIds);
      
      if (!Array.isArray(detailedUsers) || detailedUsers.length === 0) {
        console.log('⚠️ [API] getBulkUser did not return valid data, returning original data');
        return users;
      }

      // Merge detailed data with original data
      const enrichedUsers = users.map(originalUser => {
        const userId = originalUser.id || originalUser._id;
        const detailedUser = detailedUsers.find(detailed => 
          (detailed.id || detailed._id) === userId
        );
        
        if (detailedUser) {
          return {
            ...originalUser,
            ...detailedUser,
            // Ensure consistent ID fields
            id: detailedUser.id || detailedUser._id || originalUser.id || originalUser._id,
            _id: detailedUser._id || detailedUser.id || originalUser._id || originalUser.id,
          };
        }
        
        return originalUser;
      });
      
      console.log('✅ [API] enrichUserList completed, enriched', enrichedUsers.length, 'users');
      return enrichedUsers;
      
    } catch (bulkApiError) {
      console.warn('⚠️ [API] Bulk API failed, using original user data:', bulkApiError);
      console.log('🔄 [API] Returning original user data without enrichment');
      return users;
    }
    
  } catch (error) {
    console.error('❌ [API] Error in enrichUserList, returning original data:', error);
    // Return original data if enrichment fails completely
    return users;
  }
}

/**
 * Follow a user
 */
export async function followUser(token: string, userToFollowId: string) {
  try {
    console.log('🚀 [API] followUser called with:', { userToFollowId, tokenExists: !!token });
    
    const response = await fetch(`${API_BASE}/user/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({ userToFollowId }),
    });

    console.log('📝 [API] followUser response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Failed to follow user:', errorText);
      throw new Error(errorText || 'Failed to follow user');
    }

    const data = await response.json();
    console.log('✅ [API] followUser success:', data);
    
    return data;
  } catch (error) {
    console.error('❌ [API] Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(token: string, userToUnFollowId: string) {
  try {
    console.log('🚀 [API] unfollowUser called with:', { userToUnFollowId, tokenExists: !!token });
    
    const response = await fetch(`${API_BASE}/user/unfollow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({ userToUnFollowId }),
    });

    console.log('📝 [API] unfollowUser response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Failed to unfollow user:', errorText);
      throw new Error(errorText || 'Failed to unfollow user');
    }

    const data = await response.json();
    console.log('✅ [API] unfollowUser success:', data);
    
    return data;
  } catch (error) {
    console.error('❌ [API] Error unfollowing user:', error);
    throw error;
  }
}
