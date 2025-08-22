import { Platform, PermissionsAndroid, Alert, Share, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

// Try to import RNFetchBlob, fallback to null if not available
let RNFetchBlob: any = null;
try {
  RNFetchBlob = require('rn-fetch-blob');
} catch (error) {
}

const API_BASE = 'https://social-backend-y1rg.onrender.com';

export async function requestStoragePermission() {
  if (Platform.OS !== 'android') return true;
  
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "App needs access to storage to save your ticket to Downloads folder.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    return false;
  }
}

export async function downloadPdfWithRNFetchBlob(
  url: string,
  fileName: string,
  headers: Record<string, string>,
  onProgress?: (progress: number) => void
) {
  if (!RNFetchBlob) {
    throw new Error('RNFetchBlob not available');
  }

  const { config, fs } = RNFetchBlob;
  
  // For modern Android, we'll use the app's cache directory first
  // then move to Downloads using MediaLibrary if possible
  const cacheDir = fs.dirs.CacheDir;
  const tempPath = `${cacheDir}/${fileName}`;

  // Check if file exists and remove it
  const exists = await fs.exists(tempPath);
  if (exists) {
    await fs.unlink(tempPath);
  }

  try {
    // Configure download to cache directory first
    const result = await config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: false, // Don't use DownloadManager for cache
        notification: false,
        path: tempPath,
        description: `Downloading ${fileName}`,
        mediaScannable: false,
        mime: 'application/pdf',
      },
    }).fetch('GET', url, headers);

    
    // Now try to save to Downloads using MediaLibrary
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        try {
          const asset = await MediaLibrary.createAssetAsync(result.path());
          
          Alert.alert(
            'Download Complete!',
            `Ticket saved to Downloads folder as "${fileName}"`,
            [
              { text: 'OK' },
              {
                text: 'Open Downloads',
                onPress: () => {
                  Linking.openURL('file:///storage/emulated/0/Download/');
                }
              }
            ]
          );
          return asset.uri;
        } catch (createAssetError) {
          // If createAsset fails, try share method
          try {
            await Share.share({
              url: result.path(),
              title: `${fileName}`,
              message: `Your ticket. Please save to Downloads folder.`
            });
            
            Alert.alert(
              'Save Ticket',
              'Please choose "Save to Downloads" or "Files" from the share menu to save your ticket.',
              [{ text: 'OK' }]
            );
            return result.path();
          } catch (shareError) {
            Alert.alert(
              'Download Complete!',
              `Ticket downloaded to cache. You can find it in your app's cache directory.`,
              [{ text: 'OK' }]
            );
            return result.path();
          }
        }
      } else {
        // If MediaLibrary permission denied, try share method
        try {
          await Share.share({
            url: result.path(),
            title: `${fileName}`,
            message: `Your ticket. Please save to Downloads folder.`
          });
          
          Alert.alert(
            'Save Ticket',
            'Please choose "Save to Downloads" or "Files" from the share menu to save your ticket.',
            [{ text: 'OK' }]
          );
          return result.path();
        } catch (shareError) {
          Alert.alert(
            'Download Complete!',
            `Ticket downloaded to cache. You can find it in your app's cache directory.`,
            [{ text: 'OK' }]
          );
          return result.path();
        }
      }
    } catch (mediaLibraryError) {
      try {
        await Share.share({
          url: result.path(),
          title: `${fileName}`,
          message: `Your ticket. Please save to Downloads folder.`
        });
        
        Alert.alert(
          'Save Ticket',
          'Please choose "Save to Downloads" or "Files" from the share menu to save your ticket.',
          [{ text: 'OK' }]
        );
        return result.path();
      } catch (shareError) {
        Alert.alert(
          'Download Complete!',
          `Ticket downloaded to cache. You can find it in your app's cache directory.`,
          [{ text: 'OK' }]
        );
        return result.path();
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function downloadPdfWithExpo(
  blob: Blob,
  fileName: string,
  eventTitle?: string
) {
  // Convert blob to base64
  const base64String = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error('FileReader result is not a string.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to convert file blob to base64.'));
    reader.readAsDataURL(blob);
  });

  if (Platform.OS === 'android') {
    return await downloadPdfAndroid(base64String, fileName, eventTitle);
  } else {
    return await downloadPdfIOS(base64String, fileName, eventTitle);
  }
}

async function downloadPdfAndroid(
  base64String: string,
  fileName: string,
  eventTitle?: string
) {
  try {

    const tempUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(tempUri, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        try {
          const asset = await MediaLibrary.createAssetAsync(tempUri);
          
          Alert.alert(
            'Download Complete!',
            `Ticket saved to Downloads folder as "${fileName}"`,
            [
              { text: 'OK' },
              {
                text: 'Open Downloads',
                onPress: () => {
                  // Try to open Downloads folder
                  Linking.openURL('file:///storage/emulated/0/Download/');
                }
              }
            ]
          );
          return asset.uri;
        } catch (createAssetError) {
          // If createAsset fails, fall back to share method
          throw new Error('MediaLibrary createAsset failed');
        }
      } else {
        throw new Error('MediaLibrary permission denied');
      }
    } catch (mediaLibraryError) {
      
      
      // Fallback to share method
      try {
        await Share.share({
          url: tempUri,
          title: `${eventTitle || 'Event'} - Ticket`,
          message: `Your ticket for ${eventTitle || 'this event'}. Please save to Downloads folder.`
        });
        
        Alert.alert(
          'Save Ticket',
          'Please choose "Save to Downloads" or "Files" from the share menu to save your ticket.',
          [{ text: 'OK' }]
        );
        return tempUri;
      } catch (shareError) {
        
        
        // If share also fails, try using Sharing from expo-sharing
        try {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(tempUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Save Ticket',
              UTI: 'com.adobe.pdf',
            });
            
            Alert.alert(
              'Save Ticket',
              'Please save the ticket from the share menu.',
              [{ text: 'OK' }]
            );
            return tempUri;
          } else {
            throw new Error('Sharing not available');
          }
        } catch (sharingError) {
          
          
          // Final fallback: Just show success message
          Alert.alert(
            'Download Complete!',
            `Ticket saved to app directory as "${fileName}". You can find it in your app's files.`,
            [{ text: 'OK' }]
          );
          return tempUri;
        }
      }
    }
  } catch (error) {
    
    
    // Final fallback: Save to app directory and show success
    const tempUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(tempUri, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    Alert.alert(
      'Download Complete!',
      `Ticket saved to app directory as "${fileName}". You can find it in your app's files.`,
      [{ text: 'OK' }]
    );
    return tempUri;
  }
}

async function downloadPdfIOS(
  base64String: string,
  fileName: string,
  eventTitle?: string
) {
  // iOS: Save to Documents and share
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  await FileSystem.writeAsStringAsync(fileUri, base64String, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Share the file so user can save it
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Save Ticket',
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Share.share({
      url: fileUri,
      title: `${eventTitle || 'Event'} - Ticket`,
      message: `Your ticket for ${eventTitle || 'this event'}`
    });
  }
  
  Alert.alert('Success!', 'Please save the ticket from the share menu.');
  return fileUri;
}

export function isRNFetchBlobAvailable() {
  return RNFetchBlob !== null;
} 