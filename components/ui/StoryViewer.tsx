import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode, Audio } from 'expo-av';
import { X, Heart, Send, Volume2, VolumeX, MessageCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Story as AppStory } from '@/types';
import { CommentsModal } from './CommentsModel'; // Import the CommentsModal

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Story = AppStory;
const CAPTION_LENGTH_THRESHOLD = 80;

interface StoryViewerProps {
  visible: boolean;
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  onStoryComplete?: (storyId: string) => void;
  onLikeStory?: (storyId: string) => void;
  onReplyToStory?: (storyId: string, message: string) => void;
  // Add new props for comments functionality
  comments?: Array<{
    id: string;
    text: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    timestamp: string;
    isLiked?: boolean;
    likesCount?: number;
    replies?: Array<{
      id: string;
      text: string;
      user: {
        id: string;
        name: string;
        avatar: string;
      };
      timestamp: string;
    }>;
  }>;
  onSendComment?: (storyId: string, text: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyToComment?: (commentId: string, text: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  stories,
  initialStoryIndex,
  onClose,
  onStoryComplete,
  onLikeStory,
  onReplyToStory,
  comments = [], // Default to empty array
  onSendComment,
  onLikeComment,
  onReplyToComment,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const flatListRef = useRef<FlatList<Story>>(null);
  const videoRefs = useRef<Record<string, Video | null>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textInputRef = useRef<TextInput | null>(null);

  const currentStory = useMemo(() => stories?.[currentIndex], [stories, currentIndex]);

  // Filter comments for the current story
  const currentStoryComments = useMemo(() => {
    if (!currentStory) return [];
    // Assuming comments have a storyId field to associate them with stories
    // You might need to adjust this based on your data structure
    return comments.filter(comment => comment.storyId === currentStory.id) || [];
  }, [comments, currentStory]);

  useEffect(() => {
    if (!visible) return;
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
    }).catch(() => {});
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setCurrentIndex(initialStoryIndex || 0);
    setTimeout(() => {
      if (flatListRef.current && (initialStoryIndex || 0) > 0) {
        flatListRef.current.scrollToIndex({ index: initialStoryIndex, animated: false });
      }
    }, 100);
  }, [visible, initialStoryIndex]);

  useEffect(() => {
    if (!visible || !currentStory) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(0);
    setIsLoading(currentStory.type === 'video' || (currentStory.type === 'image' && !currentStory.url));
    setIsCaptionExpanded(false);

    // This logic ensures the timers and videos are paused when the modal is paused,
    // input is focused, or the comments modal is open.
    if (!isPaused && !isInputFocused && !showCommentsModal) {
      if (currentStory.type === 'image') {
        const duration = 5000;
        const interval = 50;
        timerRef.current = setTimeout(() => handleNext(), duration);
        progressTimerRef.current = setInterval(() => {
          setProgress(prev => (prev + interval / duration >= 1 ? 1 : prev + interval / duration));
        }, interval);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [visible, currentIndex, isPaused, isLoading, isInputFocused, showCommentsModal, currentStory]);

  const handleVideoStatus = (status: AVPlaybackStatus, storyId: string) => {
    if (!status.isLoaded) {
      if (!isLoading) setIsLoading(true);
      return;
    }
    if (stories[currentIndex]?.id !== storyId || !visible) return;
    if (isLoading) setIsLoading(false);

    if (status.durationMillis && status.positionMillis) {
      setProgress(status.positionMillis / status.durationMillis);
    }
    if (status.didJustFinish) {
      onStoryComplete?.(storyId);
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setIsPaused(false);
      setIsLiked(false);
      setReplyText('');
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      flatListRef.current?.scrollToIndex({ index: prev, animated: true });
      setIsPaused(false);
      setIsLiked(false);
      setReplyText('');
    }
  };

  const handlePressIn = () => {
    if (!isInputFocused && !showCommentsModal) {
      setIsPaused(true);
      if (currentStory?.type === 'video' && videoRefs.current[currentStory.id]) {
        videoRefs.current[currentStory.id]?.pauseAsync();
      }
    }
  };

  const handlePressOut = () => {
    if (!isInputFocused && !showCommentsModal) {
      setIsPaused(false);
      if (currentStory?.type === 'video' && videoRefs.current[currentStory.id]) {
        videoRefs.current[currentStory.id]?.playAsync();
      }
    }
  };
  
  const toggleMute = () => setIsMuted(m => !m);

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    if (next && currentStory) onLikeStory?.(currentStory.id);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !currentStory) return;
    onReplyToStory?.(currentStory.id, replyText.trim());
    setReplyText('');
    setIsInputFocused(false);
    textInputRef.current?.blur();
  };

  // Handle comments modal functions
  const handleSendComment = (text: string) => {
    if (currentStory && onSendComment) {
      onSendComment(currentStory.id, text);
    }
  };

  const handleCloseCommentsModal = () => {
    setShowCommentsModal(false);
    // Resume story playback when comments modal closes
    setIsPaused(false);
  };

  const handleOpenCommentsModal = () => {
    setShowCommentsModal(true);
    // Pause story when comments modal opens
    setIsPaused(true);
    if (currentStory?.type === 'video' && videoRefs.current[currentStory.id]) {
      videoRefs.current[currentStory.id]?.pauseAsync();
    }
  };

  const renderOverlays = (item) => {
    if (!item.overlayData) {
      return null;
    }

    const { canvasDimensions, textElements, stickerElements } = item.overlayData;
    const canvasWidth = canvasDimensions?.width || screenWidth;
    const canvasHeight = canvasDimensions?.height || screenHeight;

    const getPosition = (element) => {
      let x = 0;
      let y = 0;

      if (element.relativePosition) {
        x = element.relativePosition.x * screenWidth;
        y = element.relativePosition.y * screenHeight;
      } else if (element.position) {
        x = (element.position.x / canvasWidth) * screenWidth;
        y = (element.position.y / canvasHeight) * screenHeight;
      }
      return { x, y };
    };

    return (
      <View style={StyleSheet.absoluteFill}>
        {textElements?.map((textEl, index) => {
          const { x, y } = getPosition(textEl);
          return (
            <Text
              key={textEl.id || index}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                fontSize: textEl.style?.fontSize,
                fontFamily: textEl.style?.fontFamily,
                color: textEl.style?.color,
                textShadowColor: 'rgba(0,0,0,0.7)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {textEl.text}
            </Text>
          );
        })}
        {stickerElements?.map((stickerEl, index) => {
          const { x, y } = getPosition(stickerEl);
          return (
            <Text
              key={stickerEl.id || index}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                fontSize: stickerEl.size || 40,
              }}
            >
              {stickerEl.emoji}
            </Text>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Story; index: number }) => {
    const isCurrent = index === currentIndex;
    return (
      <View style={styles.storyContainer}>
        {item.type === 'video' ? (
          <Video
            ref={ref => (videoRefs.current[item.id] = ref)}
            source={{ uri: item.url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isCurrent && !isPaused && visible && !isInputFocused && !showCommentsModal}
            isLooping={false}
            isMuted={isMuted}
            onPlaybackStatusUpdate={(s) => handleVideoStatus(s, item.id)}
          />
        ) : (
          <Image
            source={{ uri: item.url }}
            style={styles.media}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
        {renderOverlays(item)}

        {isLoading && isCurrent && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>{item.type === 'video' ? 'Loading video...' : 'Loading image...'}</Text>
          </View>
        )}
      </View>
    );
  };

  if (!visible || !currentStory) return null;

  const showMoreButton = currentStory.caption && currentStory.caption.length > CAPTION_LENGTH_THRESHOLD;

  return (
    <>
      <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
        <StatusBar hidden />
        <View style={styles.container}>
          {/* Progress */}
          <View style={styles.progressContainer}>
            {stories.map((_, idx) => (
              <View key={idx} style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress * 100}%` : '0%',
                      opacity: idx <= currentIndex ? 1 : 0.3,
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <X size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Image source={{ uri: currentStory.user.avatar }} style={styles.userAvatar} />
              <View>
                <Text style={styles.userName}>{currentStory.user.name}</Text>
                {currentStory.source ? (
                  <Text style={styles.storySourceLabel}>{currentStory.source}</Text>
                ) : null}
              </View>
            </View>
            {currentStory.type === 'video' ? (
              <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
                {isMuted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
              </TouchableOpacity>
            ) : (
              <View style={styles.headerButton} />
            )}
          </View>
          
          {/* Caption with 'more' button logic */}
          {currentStory.caption ? (
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>
                {showMoreButton && !isCaptionExpanded
                  ? `${currentStory.caption.substring(0, CAPTION_LENGTH_THRESHOLD)}...`
                  : currentStory.caption}
              </Text>
              {showMoreButton && (
                <TouchableOpacity onPress={() => setIsCaptionExpanded(!isCaptionExpanded)}>
                  <Text style={styles.moreButton}>
                    {isCaptionExpanded ? 'less' : 'more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* FlatList */}
          <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <FlatList
              ref={flatListRef}
              data={stories}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              getItemLayout={(_, idx) => ({ length: screenWidth, offset: screenWidth * idx, index: idx })}
              onMomentumScrollBegin={() => setIsPaused(true)}
              onMomentumScrollEnd={({ nativeEvent }) => {
                const idx = Math.round(nativeEvent.contentOffset.x / screenWidth);
                if (idx !== currentIndex) setCurrentIndex(idx);
                setIsPaused(false);
              }}
            />
          </TouchableWithoutFeedback>

          {/* Navigation tap areas */}
          <View style={styles.overlayNav}>
            <TouchableOpacity style={styles.navArea} onPress={handlePrev} />
            <TouchableOpacity style={styles.navArea} onPress={handleNext} />
          </View>

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            {/* Comment button that opens the comments modal */}
            <TouchableOpacity style={styles.bottomAction} onPress={handleOpenCommentsModal}>
              <MessageCircle size={22} color="#fff" />
              {currentStoryComments.length > 0 && (
                <View style={styles.commentBadge}>
                  <Text style={styles.commentBadgeText}>
                    {currentStoryComments.length > 99 ? '99+' : currentStoryComments.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.commentWrapper}>
              <TextInput
                ref={textInputRef}
                style={styles.commentInput}
                placeholder="Reply to story..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={replyText}
                onChangeText={setReplyText}
                onSubmitEditing={handleSendReply}
                returnKeyType="send"
                onFocus={() => {
                  setIsInputFocused(true);
                  setIsPaused(true);
                }}
                onBlur={() => {
                  setIsInputFocused(false);
                  setIsPaused(false);
                }}
              />
              <TouchableOpacity
                style={[styles.sendBtn, { opacity: replyText.trim() ? 1 : 0.5 }]}
                onPress={handleSendReply}
                disabled={!replyText.trim()}
              >
                <Send size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.bottomAction} onPress={handleLike}>
              <Heart size={22} color={isLiked ? '#ff3040' : '#fff'} fill={isLiked ? '#ff3040' : 'none'} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <CommentsModal
        visible={showCommentsModal}
        onClose={handleCloseCommentsModal}
        storyId={currentStory?.id || ''}
        comments={currentStoryComments}
        onSendComment={handleSendComment}
        onLikeComment={onLikeComment}
        onReplyToComment={onReplyToComment}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  storyContainer: { width: screenWidth, height: screenHeight, backgroundColor: '#000' },
  media: { width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 16 },
  progressContainer: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 4,
  },
  progressBar: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 1 },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginHorizontal: 16 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, borderWidth: 2, borderColor: '#fff' },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  storySourceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  overlayNav: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  navArea: { flex: 1 },
  bottomBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  commentBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff3040',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  commentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  commentWrapper: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingLeft: 14,
    paddingRight: 44,
    justifyContent: 'center',
  },
  commentInput: { color: '#fff', fontSize: 14 },
  sendBtn: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: { color: '#fff', fontSize: 18 },
  captionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    zIndex: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  captionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moreButton: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default StoryViewer;