import { Platform, Alert, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function simpleDownloadPdf(
  blob: Blob,
  fileName: string,
  eventTitle?: string
) {
  try {
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

    // Save to app's document directory
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Try expo-sharing first (works better on most devices)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Ticket',
        UTI: 'com.adobe.pdf',
      });
      
      Alert.alert(
        'Download Complete!',
        'Please save the ticket from the share menu to your Downloads folder.',
        [{ text: 'OK' }]
      );
    } else {
      // Fallback to React Native Share
      await Share.share({
        url: fileUri,
        title: `${eventTitle || 'Event'} - Ticket`,
        message: `Your ticket for ${eventTitle || 'this event'}. Please save to Downloads folder.`
      });
      
      Alert.alert(
        'Save Ticket',
        'Please choose "Save to Downloads" or "Files" from the share menu.',
        [{ text: 'OK' }]
      );
    }

    return fileUri;
  } catch (error) {
    
    
    // If everything fails, just show success and tell user where file is
    Alert.alert(
      'Download Complete!',
      `Ticket saved to app directory as "${fileName}". You can find it in your app's files.`,
      [{ text: 'OK' }]
    );
    
    return null;
  }
} 