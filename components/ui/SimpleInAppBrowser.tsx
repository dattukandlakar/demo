import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SimpleInAppBrowserProps {
  visible: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

export default function SimpleInAppBrowser({ 
  visible, 
  url, 
  title, 
  onClose 
}: SimpleInAppBrowserProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const webViewRef = useRef<WebView>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize user agent for better performance
  const optimizedUserAgent = useMemo(() => 
    "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    []
  );

  // Optimized load handlers with useCallback
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    // Set timeout for loading (30 seconds)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setError('Request timed out');
      setLoading(false);
    }, 30000);
  }, []);

  const handleLoadProgress = useCallback(({ nativeEvent }: { nativeEvent: { progress: number } }) => {
    setProgress(nativeEvent.progress);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setProgress(1);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleError = useCallback((error: any) => {
    //console.error('WebView error:', error);
    setLoading(false);
    setError('Failed to load webpage');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleHttpError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    //console.warn('HTTP error:', nativeEvent.statusCode);
    if (nativeEvent.statusCode >= 400) {
      setError(`HTTP Error: ${nativeEvent.statusCode}`);
      setLoading(false);
    }
  }, []);

  // Block resource-heavy content for faster loading
  const injectedJavaScript = useMemo(() => `
    // Block ads and heavy resources
    (function() {
      const blockedDomains = [
        'googletagmanager.com',
        'doubleclick.net',
        'googlesyndication.com',
        'amazon-adsystem.com',
        'facebook.com/tr',
        'google-analytics.com',
        'googleadservices.com'
      ];
      
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (blockedDomains.some(domain => url.toString().includes(domain))) {
          return Promise.reject(new Error('Blocked'));
        }
        return originalFetch.apply(this, arguments);
      };
      
      // Remove heavy elements after page load
      window.addEventListener('load', function() {
        setTimeout(function() {
          const selectors = [
            'iframe[src*="ads"]',
            'div[class*="ad"]',
            'div[id*="ad"]',
            '.advertisement',
            '[class*="banner"]'
          ];
          
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
          });
        }, 1000);
      });
    })();
    true;
  `, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  //console.log('SimpleInAppBrowser rendering with:', { visible, url, title });

  if (!visible) return null;

  // Validate URL
  if (!url || url.trim() === '') {
    //console.log('SimpleInAppBrowser: No URL provided');
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.dark.background} barStyle="light-content" />
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>No URL Provided</Text>
              <Text style={styles.errorText}>Unable to load content without a valid URL.</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
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
            <TouchableOpacity style={styles.navButton} onPress={onClose}>
              <ArrowLeft size={20} color={Colors.dark.text} />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title || 'Browser'}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          {loading && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          )}

          {/* WebView */}
          <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              source={{ 
                uri: url || 'https://www.google.com',
                headers: {
                  'Cache-Control': 'max-age=3600',
                  'Accept-Encoding': 'gzip, deflate, br',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
              }}
              style={styles.webView}
              onLoadStart={handleLoadStart}
              onLoadProgress={handleLoadProgress}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              onHttpError={handleHttpError}
              injectedJavaScript={injectedJavaScript}
              // Performance optimizations
              startInLoadingState={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={false}
              mediaPlaybackRequiresUserAction={true}
              allowsBackForwardNavigationGestures={true}
              scalesPageToFit={true}
              mixedContentMode="compatibility"
              // Advanced speed optimizations
              cacheEnabled={true}
              cacheMode="LOAD_DEFAULT"
              incognito={false}
              thirdPartyCookiesEnabled={false}
              sharedCookiesEnabled={false}
              // Disable unnecessary features for maximum speed
              allowsProtectedMedia={false}
              allowsAirPlayForMediaPlayback={false}
              allowsLinkPreview={false}
              // Network and rendering optimizations
              userAgent={optimizedUserAgent}
              androidLayerType="hardware"
              androidHardwareAccelerationDisabled={false}
              renderToHardwareTextureAndroid={true}
              // Memory and resource optimizations
              allowsFullscreenVideo={false}
              bounces={false}
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              // Connection optimizations
              setSupportMultipleWindows={false}
              setBuiltInZoomControls={false}
              setDisplayZoomControls={false}
              // Additional performance props
              pullToRefreshEnabled={false}
              automaticallyAdjustContentInsets={false}
              contentInsetAdjustmentBehavior="never"
decelerationRate={0}
            />
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
                <Text style={styles.loadingText}>
                  {progress > 0 ? `Loading... ${Math.round(progress * 100)}%` : 'Loading...'}
                </Text>
              </View>
            )}
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Failed to Load</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => {
                    setError(null);
                    setLoading(true);
                    webViewRef.current?.reload();
                  }}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
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
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    height: 3,
    backgroundColor: Colors.dark.border,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
