import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    Platform,
    ActivityIndicator,
    Modal,
    PanResponder,
    Animated,
    Alert
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE } from '@/api/user';
import { usePostStore } from '@/store/post-store';
import * as FileSystem from 'expo-file-system';
// Alternative approach - no react-native-view-shot dependency

const { width, height } = Dimensions.get('window');

const editingTools = [
    { id: 'back', icon: 'chevron-back', name: 'Back' },
    { id: 'crop', icon: 'crop', name: 'Crop' },
    { id: 'text', icon: 'text', name: 'Text', component: 'Aa' },
    { id: 'sticker', icon: 'happy-outline', name: 'Stickers' },
    { id: 'effects', icon: 'sparkles', name: 'Effects' },
    { id: 'music', icon: 'musical-notes-outline', name: 'Music' },
    { id: 'more', icon: 'ellipsis-horizontal', name: 'More' }
];

const textOptions = [
    { id: 'classic', name: 'Classic', style: { fontFamily: 'System', fontSize: 24, color: '#fff' } },
    { id: 'modern', name: 'Modern', style: { fontFamily: 'System', fontSize: 28, fontWeight: 'bold', color: '#fff' } },
    { id: 'typewriter', name: 'Typewriter', style: { fontFamily: 'Courier', fontSize: 22, color: '#fff' } },
    { id: 'neon', name: 'Neon', style: { fontFamily: 'System', fontSize: 26, color: '#00ff00', textShadowColor: '#00ff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 } }
];

const textColors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
];

const availableStickers = [
    { id: '1', emoji: '😀', name: 'smile' },
    { id: '2', emoji: '😍', name: 'love' },
    { id: '3', emoji: '🔥', name: 'fire' },
    { id: '4', emoji: '💯', name: 'hundred' },
    { id: '5', emoji: '⭐', name: 'star' },
    { id: '6', emoji: '❤️', name: 'heart' },
    { id: '7', emoji: '👍', name: 'thumbs-up' },
    { id: '8', emoji: '✨', name: 'sparkles' },
    { id: '9', emoji: '🎉', name: 'party' },
    { id: '10', emoji: '🚀', name: 'rocket' },
    { id: '11', emoji: '💎', name: 'diamond' },
    { id: '12', emoji: '🌟', name: 'star2' },
];

interface TextElement {
    id: string;
    text: string;
    style: any;
    position: { x: number; y: number };
    animatedPosition?: Animated.ValueXY;
}

interface StickerElement {
    id: string;
    emoji: string;
    position: { x: number; y: number };
    animatedPosition?: Animated.ValueXY;
    size: number;
}

interface StoryEditorScreenProps {
    visible: boolean;
    onClose: () => void;
    content: {
        type: 'photo' | 'video';
        uri: string;
        filter?: string;
        source?: 'Camera' | 'Gallery';
    } | null;
    onUploadSuccess?: (response: any) => void;
}

const StoryEditorScreen: React.FC<StoryEditorScreenProps> = ({
    visible,
    onClose,
    content,
    onUploadSuccess
}) => {
    const [caption, setCaption] = useState('');
    const [isTextMode, setIsTextMode] = useState(false);
    const [textElements, setTextElements] = useState<TextElement[]>([]);
    const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
    const [selectedTextStyle, setSelectedTextStyle] = useState(textOptions[0]);
    const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showTextOptions, setShowTextOptions] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [textInput, setTextInput] = useState('');
    
    const { token } = useAuthStore();
    const { fetchStories } = usePostStore();
    const textInputRef = useRef<TextInput>(null);

    // Enhanced drag functionality for text elements
    const createTextPanResponder = (element: TextElement) => {
        if (!element.animatedPosition) {
            element.animatedPosition = new Animated.ValueXY({
                x: element.position.x,
                y: element.position.y
            });
        }

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                if (element.animatedPosition) {
                    const currentValue = element.animatedPosition._value;
                    element.animatedPosition.setOffset({
                        x: currentValue?.x || element.position.x,
                        y: currentValue?.y || element.position.y,
                    });
                    element.animatedPosition.setValue({ x: 0, y: 0 });
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                if (element.animatedPosition) {
                    Animated.event([
                        null,
                        { dx: element.animatedPosition.x, dy: element.animatedPosition.y }
                    ], { useNativeDriver: false })(evt, gestureState);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (element.animatedPosition) {
                    element.animatedPosition.flattenOffset();
                    
                    // Update the element's position in state
                    const newX = element.position.x + gestureState.dx;
                    const newY = element.position.y + gestureState.dy;
                    
                    // Keep within bounds
                    const boundedX = Math.max(50, Math.min(width - 50, newX));
                    const boundedY = Math.max(100, Math.min(height - 200, newY));
                    
                    setTextElements(prev => prev.map(el => 
                        el.id === element.id 
                            ? { ...el, position: { x: boundedX, y: boundedY } }
                            : el
                    ));
                }
            },
        });
    };

    // Enhanced drag functionality for sticker elements
    const createStickerPanResponder = (element: StickerElement) => {
        if (!element.animatedPosition) {
            element.animatedPosition = new Animated.ValueXY({
                x: element.position.x,
                y: element.position.y
            });
        }

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                if (element.animatedPosition) {
                    const currentValue = element.animatedPosition._value;
                    element.animatedPosition.setOffset({
                        x: currentValue?.x || element.position.x,
                        y: currentValue?.y || element.position.y,
                    });
                    element.animatedPosition.setValue({ x: 0, y: 0 });
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                if (element.animatedPosition) {
                    Animated.event([
                        null,
                        { dx: element.animatedPosition.x, dy: element.animatedPosition.y }
                    ], { useNativeDriver: false })(evt, gestureState);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (element.animatedPosition) {
                    element.animatedPosition.flattenOffset();
                    
                    // Update the element's position in state
                    const newX = element.position.x + gestureState.dx;
                    const newY = element.position.y + gestureState.dy;
                    
                    // Keep within bounds
                    const boundedX = Math.max(25, Math.min(width - 25, newX));
                    const boundedY = Math.max(100, Math.min(height - 200, newY));
                    
                    setStickerElements(prev => prev.map(el => 
                        el.id === element.id 
                            ? { ...el, position: { x: boundedX, y: boundedY } }
                            : el
                    ));
                }
            },
        });
    };

    const showMessageModal = (title: string, message: string) => {
        setModalTitle(title);
        setModalMessage(message);
        setShowModal(true);
    };

    const handleAddText = () => {
        if (textInput.trim()) {
            const initialPosition = { x: width / 2, y: height / 3 };
            const newTextElement: TextElement = {
                id: Date.now().toString(),
                text: textInput.trim(),
                style: { ...selectedTextStyle.style, color: selectedTextColor },
                position: initialPosition,
                animatedPosition: new Animated.ValueXY(initialPosition)
            };
            setTextElements([...textElements, newTextElement]);
            setTextInput('');
            setIsTextMode(false);
            setShowTextOptions(false);
        }
    };

    const handleAddSticker = (sticker: typeof availableStickers[0]) => {
        const initialPosition = { x: width / 2, y: height / 3 };
        const newStickerElement: StickerElement = {
            id: Date.now().toString() + sticker.id,
            emoji: sticker.emoji,
            position: initialPosition,
            animatedPosition: new Animated.ValueXY(initialPosition),
            size: 40
        };
        setStickerElements([...stickerElements, newStickerElement]);
        setShowStickerPicker(false);
    };

    const removeTextElement = (id: string) => {
        Alert.dismiss();
        setTextElements(prev => prev.filter(el => el.id !== id));
    };

    const removeStickerElement = (id: string) => {
        Alert.dismiss();
        setStickerElements(prev => prev.filter(el => el.id !== id));
    };

    const handleToolPress = (toolId: string) => {
        switch (toolId) {
            case 'back':
                onClose();
                break;
            case 'text':
                setIsTextMode(true);
                setShowTextOptions(true);
                setShowStickerPicker(false);
                setTimeout(() => {
                    textInputRef.current?.focus();
                }, 100);
                break;
            case 'sticker':
                setShowStickerPicker(true);
                setShowTextOptions(false);
                setIsTextMode(false);
                break;
            case 'crop':
            case 'effects':
            case 'music':
            case 'more':
                showMessageModal('Coming Soon', 'This feature will be available soon!');
                break;
        }
    };

    // Alternative approach: Send overlay data to server for server-side composition
    const prepareStoryData = () => {
        const hasOverlays = textElements.length > 0 || stickerElements.length > 0;
        
        return {
            originalUri: content?.uri,
            contentType: content?.type,
            hasOverlays,
            overlayData: {
                textElements: textElements.map(el => ({
                    id: el.id,
                    text: el.text,
                    style: {
                        fontSize: el.style.fontSize,
                        fontFamily: el.style.fontFamily,
                        fontWeight: el.style.fontWeight,
                        color: el.style.color,
                        textShadowColor: el.style.textShadowColor,
                        textShadowOffset: el.style.textShadowOffset,
                        textShadowRadius: el.style.textShadowRadius,
                    },
                    position: el.position,
                    // Add relative position for better server-side rendering
                    relativePosition: {
                        x: el.position.x / width,
                        y: el.position.y / height
                    }
                })),
                stickerElements: stickerElements.map(el => ({
                    id: el.id,
                    emoji: el.emoji,
                    position: el.position,
                    size: el.size,
                    // Add relative position for better server-side rendering
                    relativePosition: {
                        x: el.position.x / width,
                        y: el.position.y / height
                    }
                })),
                // Canvas dimensions for server reference
                canvasDimensions: {
                    width,
                    height
                }
            }
        };
    };

    const uploadStory = async () => {
        if (!content) {
            showMessageModal('Error', 'No content to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(10);
            
            // Prepare story data with overlay information
            const storyData = prepareStoryData();
            setUploadProgress(30);

            const formData = new FormData();
            
            // Add main media file
            formData.append('media', {
                uri: content.uri,
                type: content.type === 'photo' ? 'image/jpeg' : 'video/mp4',
                name: `story_${Date.now()}.${content.type === 'photo' ? 'jpg' : 'mp4'}`
            } as any);

            // Add all the metadata
            formData.append('caption', caption);
            formData.append('filter', content.filter || 'none');
            formData.append('hasOverlays', storyData.hasOverlays.toString());
            formData.append('contentType', content.type);
            formData.append('timestamp', Date.now().toString());
            
            // Add overlay data as JSON string for server-side processing
            if (storyData.hasOverlays) {
                formData.append('overlayData', JSON.stringify(storyData.overlayData));
                formData.append('requiresComposition', 'true');
            }
            
            if (content.source) {
                formData.append('source', content.source);
            }

            setUploadProgress(60);
            
            const response = await fetch(`https://social-backend-y1rg.onrender.com/user/upload/story`, {
                method: 'POST',
                headers: {
                    'token': token,
                },
                body: formData,
            });

            setUploadProgress(90);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setUploadProgress(100);
            
            // Refresh stories
            fetchStories();
            
            showMessageModal('Success', 'Story uploaded successfully!');
            onUploadSuccess?.(result);

        } catch (error) {
            // console.error('Upload error:', error);
            showMessageModal('Error', 'Failed to upload story. Please try again due to connection issues.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    if (!visible || !content) {
        return null;
    }

    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.contentContainer}>
                    {content.type === 'photo' ? (
                        <Image source={{ uri: content.uri }} style={styles.contentImage} resizeMode="cover" />
                    ) : (
                        <Video
                            source={{ uri: content.uri }}
                            style={styles.contentImage}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay
                            isLooping
                            useNativeControls={false}
                        />
                    )}
                    
                    {/* Render Text Elements */}
                    {textElements.map((textElement) => (
                        <Animated.View
                            key={textElement.id}
                            style={[
                                styles.textOverlay,
                                {
                                    transform: textElement.animatedPosition ? 
                                        textElement.animatedPosition.getTranslateTransform() : 
                                        [
                                            { translateX: textElement.position.x - 50 },
                                            { translateY: textElement.position.y - 20 }
                                        ]
                                }
                            ]}
                            {...createTextPanResponder(textElement).panHandlers}
                        >
                            <TouchableOpacity
                                onLongPress={() => {
                                    Alert.alert(
                                        'Delete Text',
                                        'Do you want to remove this text?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Delete', onPress: () => removeTextElement(textElement.id) }
                                        ]
                                    );
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={textElement.style}>{textElement.text}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {/* Render Sticker Elements */}
                    {stickerElements.map((stickerElement) => (
                        <Animated.View
                            key={stickerElement.id}
                            style={[
                                styles.stickerOverlay,
                                {
                                    transform: stickerElement.animatedPosition ? 
                                        stickerElement.animatedPosition.getTranslateTransform() : 
                                        [
                                            { translateX: stickerElement.position.x - stickerElement.size / 2 },
                                            { translateY: stickerElement.position.y - stickerElement.size / 2 }
                                        ]
                                }
                            ]}
                            {...createStickerPanResponder(stickerElement).panHandlers}
                        >
                            <TouchableOpacity
                                onLongPress={() => {
                                    Alert.alert(
                                        'Delete Sticker',
                                        'Do you want to remove this sticker?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Delete', onPress: () => removeStickerElement(stickerElement.id) }
                                        ]
                                    );
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.stickerText, { fontSize: stickerElement.size }]}>
                                    {stickerElement.emoji}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                    
                    {content.filter && content.filter !== 'Original' && (
                        <View style={styles.filterIndicator}>
                            <Text style={styles.filterText}>{content.filter}</Text>
                        </View>
                    )}
                </View>

                {/* Top Toolbar */}
                <View style={styles.topToolbar}>
                    {editingTools.map((tool) => (
                        <TouchableOpacity
                            key={tool.id}
                            style={styles.toolButton}
                            onPress={() => handleToolPress(tool.id)}
                        >
                            {tool.component ? (
                                <Text style={styles.toolText}>{tool.component}</Text>
                            ) : (
                                <Ionicons name={tool.icon as any} size={24} color="white" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Text Input Mode */}
                {isTextMode && (
                    <View style={styles.textInputContainer}>
                        <TextInput
                            ref={textInputRef}
                            style={[
                                styles.textInput,
                                selectedTextStyle.style,
                                { color: selectedTextColor }
                            ]}
                            placeholder="Add text..."
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            value={textInput}
                            onChangeText={setTextInput}
                            multiline
                            autoFocus={true}
                        />
                        <TouchableOpacity 
                            style={styles.addTextButton} 
                            onPress={handleAddText}
                        >
                            <Text style={styles.addTextButtonText}>Add Text</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Text Options */}
                {showTextOptions && (
                    <View style={styles.textOptionsContainer}>
                        <View style={styles.textStylesRow}>
                            {textOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.textStyleButton,
                                        selectedTextStyle.id === option.id && styles.selectedTextStyle
                                    ]}
                                    onPress={() => setSelectedTextStyle(option)}
                                >
                                    <Text style={[option.style, { fontSize: 16 }]}>Aa</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.colorPaletteRow}>
                            {textColors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorButton,
                                        { backgroundColor: color },
                                        selectedTextColor === color && styles.selectedColor
                                    ]}
                                    onPress={() => setSelectedTextColor(color)}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Sticker Picker */}
                {showStickerPicker && (
                    <View style={styles.stickerPickerContainer}>
                        <View style={styles.stickerGrid}>
                            {availableStickers.map((sticker) => (
                                <TouchableOpacity
                                    key={sticker.id}
                                    style={styles.stickerButton}
                                    onPress={() => handleAddSticker(sticker)}
                                >
                                    <Text style={styles.stickerPreview}>{sticker.emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Caption Input */}
                <View style={styles.captionContainer}>
                    <TextInput
                        style={styles.captionInput}
                        placeholder="Add a caption..."
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                        maxLength={250}
                    />
                </View>

                {/* Share Container */}
                <View style={styles.shareContainer}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={uploadStory}
                        disabled={isUploading}
                    >
                        <View style={styles.shareButtonContent}>
                            <Image
                                source={{ uri: 'https://placehold.co/50x50/666/fff?text=You' }}
                                style={styles.shareAvatar}
                            />
                            {isUploading ? (
                                <View style={styles.uploadingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.uploadingText}>
                                        {uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}%` : 'Uploading...'}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.shareButtonText}>Your Story</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Success/Error Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <Text style={styles.modalMessage}>{modalMessage}</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    contentImage: {
        width: '100%',
        height: '100%',
    },
    textOverlay: {
        position: 'absolute',
        minWidth: 100,
        minHeight: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    stickerOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    stickerText: {
        fontSize: 40,
    },
    filterIndicator: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    filterText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    topToolbar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        zIndex: 20,
    },
    toolButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    textInputContainer: {
        position: 'absolute',
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 15,
    },
    textInput: {
        width: '80%',
        textAlign: 'center',
        marginBottom: 20,
    },
    addTextButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addTextButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    textOptionsContainer: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 15,
    },
    textStylesRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    textStyleButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
    },
    selectedTextStyle: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    colorPaletteRow: {
        flexDirection: 'row',
    },
    colorButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 5,
    },
    selectedColor: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    stickerPickerContainer: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingVertical: 20,
        zIndex: 15,
    },
    stickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    stickerButton: {
        margin: 8,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
    },
    stickerPreview: {
        fontSize: 30,
    },
    captionContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        zIndex: 15,
    },
    captionInput: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    shareContainer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 15,
    },
    shareButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    shareButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shareAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },
    shareButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    uploadingText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#1c1c1e',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default StoryEditorScreen;