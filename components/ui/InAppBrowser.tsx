import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView, WebViewErrorEvent } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  X
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface InAppBrowserProps {
  visible: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

export default function InAppBrowser({ visible, url, title, onClose }: InAppBrowserProps) {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate URL function
  const isValidUrl = useMemo(() => {
    if (!url || url.trim() === '') {
      console.log('InAppBrowser: Empty URL provided');
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      console.log('InAppBrowser: Valid URL:', url);
      return true;
    } catch (e) {
      console.log('InAppBrowser: Invalid URL:', url, e);
      return false;
    }
  }, [url]);

  // Reset states when URL changes
  const resetStates = useCallback(() => {
    setLoading(true);
    setLoadingProgress(0);
    setHasError(false);
    setErrorMessage('');
    setCanGoBack(false);
    setCanGoForward(false);
  }, []);

  // Handle navigation state changes
  const handleNavigationStateChange = useCallback((navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setLoading(navState.loading);
  }, []);

  // Handle loading progress
  const handleLoadProgress = useCallback(({ nativeEvent }: any) => {
    setLoadingProgress(nativeEvent.progress);
  }, []);

  // Handle load start
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setHasError(false);
    setLoadingProgress(0);
  }, []);

  // Handle load end
  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setLoadingProgress(1);
  }, []);

  // Handle WebView errors
  const handleError = useCallback((errorEvent: WebViewErrorEvent) => {
    console.error('WebView Error:', errorEvent.nativeEvent);
    setHasError(true);
    setLoading(false);
    setErrorMessage(errorEvent.nativeEvent.description || 'Failed to load webpage');
  }, []);

  // Handle HTTP errors
  const handleHttpError = useCallback((errorEvent: any) => {
    console.error('WebView HTTP Error:', errorEvent.nativeEvent);
    setHasError(true);
    setLoading(false);
    setErrorMessage(`HTTP Error: ${errorEvent.nativeEvent.statusCode}`);
  }, []);

  // Navigation functions
  const handleBackPress = useCallback(() => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    } else {
      onClose();
    }
  }, [canGoBack, onClose]);

  const goForward = useCallback(() => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  }, [canGoForward]);

  const reload = useCallback(() => {
    if (webViewRef.current) {
      resetStates();
      webViewRef.current.reload();
    }
  }, [resetStates]);

  const retryLoad = useCallback(() => {
    resetStates();
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, [resetStates]);

  // Don't render if URL is invalid
  if (!isValidUrl) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.dark.background} barStyle="light-content" />
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Invalid URL</Text>
              <Text style={styles.errorMessage}>The provided URL is not valid.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onClose}>
                <Text style={styles.retryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar backgroundColor={Colors.dark.background} barStyle="light-content" />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.navigationControls}>
              <TouchableOpacity
                style={[styles.navButton, !canGoBack && styles.disabledButton]}
                onPress={handleBackPress}
                disabled={!canGoBack && !visible}
              >
                <ArrowLeft size={20} color={Colors.dark.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.navButton, !canGoForward && styles.disabledButton]}
                onPress={goForward}
                disabled={!canGoForward}
              >
                <ArrowRight size={20} color={Colors.dark.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={reload}
              >
                <RotateCcw size={20} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title || 'Connektx'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={20} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          {loading && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${loadingProgress * 100}%` }]} />
            </View>
          )}

          {/* WebView Container */}
          <View style={styles.webViewContainer}>
            {hasError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Failed to Load</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <WebView
                  ref={webViewRef}
                  source={{ uri: url || 'https://www.google.com' }}
                  style={styles.webView}
                  onNavigationStateChange={handleNavigationStateChange}
                  onLoadStart={handleLoadStart}
                  onLoadEnd={handleLoadEnd}
                  onLoadProgress={handleLoadProgress}
                  onError={handleError}
                  onHttpError={handleHttpError}
                  startInLoadingState={true}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsBackForwardNavigationGestures={true}
                  mixedContentMode="compatibility"
                  userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1"
                />
                
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.dark.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                    <Text style={styles.progressText}>
                      {Math.round(loadingProgress * 100)}%
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
  },
  disabledButton: {
    opacity: 0.5,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.dark.text,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  progressContainer: {
    height: 3,
    backgroundColor: Colors.dark.border,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    transition: 'width 0.3s ease',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.dark.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  retryButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
