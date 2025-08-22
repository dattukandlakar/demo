# PDF Download Implementation

This implementation provides a comprehensive solution for downloading PDF files in React Native, with support for both Android and iOS platforms.

## Features

- **RNFetchBlob Support**: Uses RNFetchBlob for better Android download management when available
- **Expo Fallback**: Falls back to Expo FileSystem and MediaLibrary APIs when RNFetchBlob is not available
- **Progress Tracking**: Real-time download progress with animated progress bars
- **Permission Handling**: Automatic storage permission requests for Android
- **Multiple Download Methods**: Direct download to Downloads folder, MediaLibrary, and share options
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Cross-Platform**: Works on both Android and iOS with platform-specific optimizations

## Installation

### 1. Install RNFetchBlob (Optional but Recommended)

```bash
npm install rn-fetch-blob
```

### 2. Required Expo Dependencies

The following Expo packages are already included in your project:
- `expo-file-system`
- `expo-media-library`
- `expo-sharing`

## Usage

### Basic Usage

```tsx
import { downloadPdfWithRNFetchBlob, downloadPdfWithExpo, isRNFetchBlobAvailable } from '@/utils/downloadUtils';

// Example 1: Using RNFetchBlob (Android)
const downloadWithRNFetchBlob = async () => {
  try {
    const url = 'https://example.com/document.pdf';
    const fileName = 'document.pdf';
    const headers = {
      'Authorization': 'Bearer your-token',
      'Accept': 'application/pdf',
    };

    await downloadPdfWithRNFetchBlob(url, fileName, headers, (progress) => {
    });
  } catch (error) {
  }
};

// Example 2: Using Expo method (Fallback)
const downloadWithExpo = async () => {
  try {
    const response = await fetch('https://example.com/document.pdf');
    const blob = await response.blob();
    
    await downloadPdfWithExpo(blob, 'document.pdf', 'Document Title');
  } catch (error) {
  }
};
```

### Using the DownloadButton Component

```tsx
import DownloadButton from '@/components/ui/DownloadButton';

function MyComponent() {
  return (
    <DownloadButton
      url="https://example.com/document.pdf"
      fileName="document.pdf"
      headers={{
        'Authorization': 'Bearer your-token',
        'Accept': 'application/pdf',
      }}
      title="Download PDF"
      onProgress={(progress) => console.log(`Progress: ${progress}%`)}
    />
  );
}
```

### Integration with Ticket Download

The ticket download functionality is already integrated in `social/app/event/ticket/[id].tsx`. It automatically:

1. Checks if RNFetchBlob is available
2. Uses RNFetchBlob for Android if available
3. Falls back to Expo methods if RNFetchBlob is not available
4. Handles permissions automatically
5. Shows download progress
6. Provides user feedback

## Implementation Details

### RNFetchBlob Method (Android)

When RNFetchBlob is available on Android:

1. **Permission Request**: Automatically requests storage permission
2. **Download Configuration**: Uses Android's DownloadManager for better reliability
3. **File Management**: Saves directly to Downloads folder
4. **Progress Tracking**: Real-time progress updates
5. **Notification**: Shows download notification in status bar

### Expo Fallback Method

When RNFetchBlob is not available:

1. **Blob Download**: Downloads file as blob using fetch
2. **Base64 Conversion**: Converts blob to base64 for file writing
3. **Platform-Specific Handling**:
   - **Android**: Tries direct Downloads folder → MediaLibrary → Share
   - **iOS**: Saves to Documents and uses share sheet

### Error Handling

The implementation handles various error scenarios:

- Network errors
- Permission denials
- File system errors
- Empty downloads
- Invalid responses

## File Structure

```
social/
├── utils/
│   └── downloadUtils.ts          # Core download utilities
├── components/
│   └── ui/
│       └── DownloadButton.tsx    # Reusable download button component
└── app/
    └── event/
        └── ticket/
            └── [id].tsx          # Ticket download implementation
```

## API Reference

### `downloadPdfWithRNFetchBlob(url, fileName, headers, onProgress?)`

Downloads a PDF using RNFetchBlob.

- `url`: The URL to download from
- `fileName`: The name to save the file as
- `headers`: HTTP headers for the request
- `onProgress`: Optional progress callback function

### `downloadPdfWithExpo(blob, fileName, eventTitle?)`

Downloads a PDF using Expo APIs.

- `blob`: The file blob to download
- `fileName`: The name to save the file as
- `eventTitle`: Optional title for user feedback

### `requestStoragePermission()`

Requests storage permission on Android.

### `isRNFetchBlobAvailable()`

Checks if RNFetchBlob is available.

## Platform-Specific Behavior

### Android

1. **With RNFetchBlob**: Direct download to Downloads folder with notification
2. **Without RNFetchBlob**: Multiple fallback methods (Downloads → MediaLibrary → Share)

### iOS

1. **Always uses Expo method**: Saves to Documents and opens share sheet
2. **No special permissions required**: Uses app's document directory

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure storage permission is granted on Android
2. **Download Fails**: Check network connection and API endpoint
3. **File Not Found**: Verify the file exists and is accessible
4. **RNFetchBlob Not Working**: Falls back to Expo method automatically

### Debug Tips

1. Check console logs for detailed error messages
2. Verify API endpoint returns valid PDF
3. Test with different file sizes
4. Check device storage space

## Example Implementation

Here's a complete example of how the download functionality works in the ticket screen:

```tsx
const handleDownloadTicket = async () => {
  if (!event || !user || !ticket) {
    Alert.alert('Error', 'Unable to download ticket. Please try again.');
    return;
  }

  setDownloading(true);
  setDownloadProgress(0);
  setDownloadComplete(false);

  try {
    const fileName = `ticket-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}-${user.email.split('@')[0]}.pdf`;
    
    if (Platform.OS === 'android' && isRNFetchBlobAvailable()) {
      // Use RNFetchBlob for Android
      const url = `https://social-backend-y1rg.onrender.com/event/ticket/${event.id}/${encodeURIComponent(user.email)}`;
      const headers = {
        'token': token || '',
        'Accept': 'application/pdf',
      };
      
      await downloadPdfWithRNFetchBlob(url, fileName, headers, (progress) => {
        setDownloadProgress(progress);
      });
    } else {
      // Fallback to Expo method
      const blob = await downloadTicket(token || '', event.id || '', user.email || '');
      await downloadPdfWithExpo(blob, fileName, event.title);
    }

    setDownloadComplete(true);
  } catch (error) {
    Alert.alert('Download Failed', 'Failed to download ticket. Please try again.');
  } finally {
    setDownloading(false);
  }
};
```

This implementation provides a robust, user-friendly download experience that works across different platforms and handles various edge cases gracefully. 