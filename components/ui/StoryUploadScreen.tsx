import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator, Modal } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const optionsData = [
  { id: '1', title: 'Templates', icon: 'camera-outline', color: '#ff6666' },
  { id: '2', title: 'Music', icon: 'musical-notes-outline', color: '#8844ff' },
  { id: '3', title: 'AI Images', icon: 'sparkles', color: '#ff88ff', isNew: true },
];

const mediaCategories = [
  { id: 'recent', title: 'Recent', icon: 'time-outline' },
  { id: 'photos', title: 'Photos', icon: 'image-outline' },
  { id: 'videos', title: 'Videos', icon: 'videocam-outline' },
  { id: 'albums', title: 'All Albums', icon: 'folder-outline' },
];

interface StoryUploadScreenProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelect: (media: { uri: string, type: 'photo' | 'video' }) => void;
  onCameraPress: () => void;
}

const StoryUploadScreen: React.FC<StoryUploadScreenProps> = ({ 
  visible, 
  onClose, 
  onMediaSelect, 
  onCameraPress 
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('recent');
  const [deviceMedia, setDeviceMedia] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loadedCount, setLoadedCount] = useState(50);

  // Debug logging
  useEffect(() => {
   
  }, [visible, onClose, onMediaSelect, onCameraPress]);

  useEffect(() => {
    if (visible) {
      
      getMedia();
    } else {
    
    }
  }, [visible, selectedCategory]);

  const getMedia = async () => {
    setIsLoading(true);
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status === 'granted') {
      try {
        await loadMediaByCategory(selectedCategory);
        if (selectedCategory === 'albums') {
          await loadAlbums();
        }
      } catch (error) {
        console.error("Failed to fetch media library:", error);
      }
    }
    setIsLoading(false);
  };

  const loadMediaByCategory = async (category: string) => {
    let mediaType: any[] = ['photo', 'video'];
    let sortBy = [MediaLibrary.SortBy.creationTime];

    switch (category) {
      case 'photos':
        mediaType = ['photo'];
        break;
      case 'videos':
        mediaType = ['video'];
        break;
      case 'recent':
      default:
        mediaType = ['photo', 'video'];
        break;
    }

    if (category !== 'albums') {
      const assets = await MediaLibrary.getAssetsAsync({
        first: loadedCount,
        mediaType: mediaType,
        sortBy: sortBy,
      });
      setDeviceMedia([{ id: 'camera', type: 'camera' }, ...assets.assets]);
    }
  };

  const loadAlbums = async () => {
    try {
      const albumsResult = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });
      setAlbums(albumsResult);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    }
  };

  const loadMoreMedia = async () => {
    if (selectedCategory === 'albums') return;
    
    setLoadedCount(prev => prev + 50);
    await loadMediaByCategory(selectedCategory);
  };

  const handleHeaderAction = (action: string) => {
    if (action === 'close') {
      onClose?.();
    }
  };

  const handleOptionPress = (title: string) => {
    
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
    setLoadedCount(50);
  };

  const getCurrentCategoryTitle = () => {
    const category = mediaCategories.find(cat => cat.id === selectedCategory);
    return category ? category.title : 'Recent';
  };

  const handleCameraPress = () => {
    
    if (onCameraPress && typeof onCameraPress === 'function') {
      onCameraPress();
    } else {
      console.error('onCameraPress is not a function:', onCameraPress);
    }
  };

  const handleMediaItemPress = (item: any) => {
    const mediaData = {
      uri: item.uri,
      type: item.mediaType === MediaLibrary.MediaType.video ? 'video' as const : 'photo' as const,
      source: 'Gallery' as const,
    };
    
   
    
    if (onMediaSelect && typeof onMediaSelect === 'function') {
      onMediaSelect(mediaData);
    } else {
      console.error('onMediaSelect is not a function:', onMediaSelect);
    }
  };

  const renderOption = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.optionButton}
      onPress={() => handleOptionPress(item.title)}
    >
      <View style={[styles.optionCircle, { 
        backgroundColor: item.color, 
        borderColor: item.isNew ? '#007bff' : 'transparent', 
        borderWidth: item.isNew ? 2 : 0 
      }]}>
        <Ionicons name={item.icon} size={24} color="white" />
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>
      <Text style={styles.optionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderCategoryDropdownItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.dropdownItem, selectedCategory === item.id && styles.selectedDropdownItem]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Ionicons name={item.icon} size={20} color={selectedCategory === item.id ? '#007bff' : 'white'} />
      <Text style={[styles.dropdownItemText, selectedCategory === item.id && styles.selectedDropdownItemText]}>
        {item.title}
      </Text>
      {selectedCategory === item.id && (
        <Ionicons name="checkmark" size={20} color="#007bff" />
      )}
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.albumItem}
      onPress={() => {
        // console.log(`Selected album: ${item.title}`);
      }}
    >
      <View style={styles.albumImageContainer}>
        <View style={styles.albumPlaceholder}>
          <Ionicons name="folder-outline" size={30} color="white" />
        </View>
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle}>{item.title}</Text>
        <Text style={styles.albumCount}>{item.assetCount} items</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }: { item: any }) => {
    if (item.type === 'camera') {
      return (
        <TouchableOpacity 
          style={styles.cameraItem}
          onPress={handleCameraPress}
        >
          <Ionicons name="camera-outline" size={40} color="white" />
          <Text style={styles.cameraText}>Camera</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.recentItem}
        onPress={() => handleMediaItemPress(item)}
      >
        <Image source={{ uri: item.uri }} style={styles.recentImage} />
        {item.mediaType === MediaLibrary.MediaType.video && (
          <>
            <View style={styles.videoIcon}>
              <Ionicons name="play" size={16} color="white" />
            </View>
            <View style={styles.timestampContainer}>
              <Text style={styles.timestampText}>
                {item.duration ? `${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, '0')}` : 'Video'}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) {
    return null;
  }

  if (hasPermission === false) {
    return (
      <Modal
        animationType="slide"
        visible={visible}
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Permission to access media library is required to continue.</Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={() => MediaLibrary.requestPermissionsAsync()}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: '#666', marginTop: 10 }]}
            onPress={onClose}
          >
            <Text style={styles.permissionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => handleHeaderAction('close')}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add to story</Text>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => handleHeaderAction('share')}
          >
            <FontAwesome name="share-square-o" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          <FlatList
            horizontal
            data={optionsData}
            renderItem={renderOption}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />
        </View>

        <View style={styles.recentsHeaderContainer}>
          <TouchableOpacity 
            style={styles.recentsHeader} 
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <View style={styles.categoryTitleContainer}>
              <Text style={styles.recentsTitle}>{getCurrentCategoryTitle()}</Text>
            </View>
            <Ionicons 
              name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.dropdown}>
              <FlatList
                data={mediaCategories}
                renderItem={renderCategoryDropdownItem}
                keyExtractor={item => item.id}
                style={styles.dropdownList}
              />
            </View>
          )}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading {getCurrentCategoryTitle().toLowerCase()}...</Text>
          </View>
        )}

        {!isLoading && (
          <View style={styles.recentsGrid}>
            {selectedCategory === 'albums' ? (
              <FlatList
                key="albums-list"
                data={albums}
                renderItem={renderAlbumItem}
                keyExtractor={item => item.id}
                style={styles.albumsList}
                onEndReached={loadMoreMedia}
                onEndReachedThreshold={0.5}
              />
            ) : (
              <FlatList
                key="media-grid"
                data={deviceMedia}
                renderItem={renderRecentItem}
                keyExtractor={item => item.id}
                numColumns={3}
                columnWrapperStyle={styles.row}
                style={styles.recentsGrid}
                onEndReached={loadMoreMedia}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  deviceMedia.length >= loadedCount ? (
                    <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreMedia}>
                      <Text style={styles.loadMoreText}>Load More</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    paddingVertical: 16,
  },
  optionButton: {
    alignItems: 'center',
    width: 100,
  },
  optionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  newText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionText: {
    color: 'white',
    fontSize: 12,
  },
  recentsHeaderContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  recentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  dropdown: {
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    marginTop: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  selectedDropdownItem: {
    backgroundColor: '#007bff20',
  },
  dropdownItemText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  selectedDropdownItemText: {
    color: '#007bff',
    fontWeight: '600',
  },
  recentsGrid: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  cameraItem: {
    width: '33.33%',
    aspectRatio: 1,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
    padding: 10,
  },
  cameraText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
  },
  recentItem: {
    width: '33.33%',
    aspectRatio: 1,
    marginBottom: 1,
    position: 'relative',
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  videoIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestampContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  timestampText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  loadMoreText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  albumsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  albumImageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  albumPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  albumCount: {
    color: '#999',
    fontSize: 14,
  },
});

export default StoryUploadScreen;