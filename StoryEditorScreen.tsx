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
    ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE } from '@/api/user';
import { usePostStore } from '@/store/post-store';
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

// Filter definitions with their corresponding style properties
const filterOptions = [
    {
        id: 'original',
        name: 'Original',
        style: {}
    },
    {
        id: 'vintage',
        name: 'Vintage',
        style: {
            filter: 'sepia(0.8) contrast(1.2) brightness(0.9)',
            tintColor: 'rgba(139, 69, 19, 0.3)'
        }
    },
    {
        id: 'blackwhite',
        name: 'B&W',
        style: {
            filter: 'grayscale(1) contrast(1.1)',
        }
    },
    {
        id: 'warm',
        name: 'Warm',
        style: {
            filter: 'saturate(1.3) brightness(1.1)',
            tintColor: 'rgba(255, 165, 0, 0.2)'
        }
    },
    {
        id: 'cool',
        name: 'Cool',
        style: {
            filter: 'saturate(1.2) hue-rotate(10deg)',
            tintColor: 'rgba(0, 191, 255, 0.2)'
        }
    },
    {
        id: 'dramatic',
        name: 'Dramatic',
        style: {
            filter: 'contrast(1.5) brightness(0.8) saturate(1.4)',
        }
    },
    {
        id: 'bright',
        name: 'Bright',
        style: {
            filter: 'brightness(1.3) saturate(1.2) contrast(0.9)',
        }
    },
    {
        id: 'moody',
        name: 'Moody',
        style: {
            filter: 'brightness(0.7) contrast(1.3) saturate(0.8)',
            tintColor: 'rgba(0, 0, 0, 0.3)'
        }
    },
    {
        id: 'sunset',
        name: 'Sunset',
        style: {
            filter: 'saturate(1.4) brightness(1.1)',
            tintColor: 'rgba(255, 140, 0, 0.25)'
        }
    },
    {
        id: 'arctic',
        name: 'Arctic',
        style: {
            filter: 'brightness(1.2) saturate(0.8) hue-rotate(180deg)',
            tintColor: 'rgba(173, 216, 230, 0.3)'
        }
    }
];

interface StoryEditorScreenProps {
    visible: boolean;
    onClose: () => void;
    content: {
        type: 'photo' | 'video';
        uri: string;
        filter?: string;
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
    const [textElements, setTextElements] = useState([]);
    const [selectedTextStyle, setSelectedTextStyle] = useState(textOptions[0]);
    const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showTextOptions, setShowTextOptions] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
    const { token } = useAuthStore();
    const { fetchStories} = usePostStore();

    const textInputRef = useRef(null);

    const showMessageModal = (title, message) => {
        setModalTitle(title);
        setModalMessage(message);
        setShowModal(true);
    };

    const handleAddText = (text: string) => {
        if (text.trim()) {
            const newTextElement = {
                id: Date.now().toString(),
                text: text.trim(),
                style: { ...selectedTextStyle.style, color: selectedTextColor },
                position: { x: width / 2, y: height / 2 }
            };
            setTextElements([...textElements, newTextElement]);
            setIsTextMode(false);
            setShowTextOptions(false);
        }
    };

    const handleFilterSelect = (filter) => {
        setSelectedFilter(filter);
        setShowFilters(false);
    };

    const handleToolPress = (toolId: string) => {
        switch (toolId) {
            case 'back':
                onClose();
                break;
            case 'text':
                setIsTextMode(true);
                setShowTextOptions(true);
                setTimeout(() => {
                    textInputRef.current?.focus();
                }, 100);
                break;
            case 'effects':
                setShowFilters(true);
                break;
            case 'crop':
            case 'sticker':
            case 'music':
            case 'more':
                console.log(`${toolId} tool pressed`);
                break;
        }
    };

    const uploadStory = async () => {
        if (!content) {
            showMessageModal('Error', 'No content to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(20);
            const formData = new FormData();
            formData.append('media', {
                uri: content.uri,
                type: content.type === 'photo' ? 'image/jpeg' : 'video/mp4',
                name: `story_${Date.now()}.${content.type === 'photo' ? 'jpg' : 'mp4'}`
            });

            formData.append('caption', caption);
            formData.append('filter', selectedFilter.id);
            formData.append('textElements', JSON.stringify(textElements));
            formData.append('timestamp', Date.now().toString());

            setUploadProgress(50);
            const response = await fetch(`https://d11cc50cb93d.ngrok-free.app/user/upload/story`, {
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
            fetchStories();
            showMessageModal(
                'Success',
                'Story uploaded successfully!'
            );
            onUploadSuccess?.(result);

        } catch (error) {
            console.error('Upload error:', error);
            showMessageModal('Error', 'Failed to upload story. Please try again. due to low internet connection ');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleShare = (platform: string) => {
        if (platform === 'your_stories') {
            uploadStory();
        } else {
            console.log(`Sharing to ${platform}`);
        }
    };

    const getFilteredImageStyle = () => {
        const baseStyle = {
            width: '100%',
            height: '100%',
        };

        if (selectedFilter.id === 'original') {
            return baseStyle;
        }

        // For React Native, we'll use tintColor and other properties
        // Note: CSS filters like 'filter' property don't work in React Native
        // You might need to use libraries like react-native-image-filter-kit for advanced filters
        return {
            ...baseStyle,
            tintColor: selectedFilter.style.tintColor,
        };
    };

    const renderFilterOverlay = () => {
        if (selectedFilter.id === 'original' || !selectedFilter.style.tintColor) {
            return null;
        }

        return (
            <View style={[
                styles.filterOverlay,
                { backgroundColor: selectedFilter.style.tintColor }
            ]} />
        );
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
                    <Image 
                        source={{ uri: content.uri }} 
                        style={getFilteredImageStyle()} 
                        resizeMode="cover" 
                    />
                    {renderFilterOverlay()}
                    
                    {textElements.map((textElement) => (
                        <View
                            key={textElement.id}
                            style={[
                                styles.textOverlay,
                                {
                                    left: textElement.position.x - 50,
                                    top: textElement.position.y - 20
                                }
                            ]}
                        >
                            <Text style={textElement.style}>{textElement.text}</Text>
                        </View>
                    ))}
                    
                    {selectedFilter.id !== 'original' && (
                        <View style={styles.filterIndicator}>
                            <Text style={styles.filterText}>{selectedFilter.name}</Text>
                        </View>
                    )}
                </View>

                {/* Filter Selection Modal */}
                {showFilters && (
                    <View style={styles.filtersContainer}>
                        <View style={styles.filtersHeader}>
                            <TouchableOpacity 
                                style={styles.filtersCloseButton}
                                onPress={() => setShowFilters(false)}
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.filtersTitle}>Choose Filter</Text>
                            <View style={{ width: 24 }} />
                        </View>
                        
                        <ScrollView 
                            horizontal 
                            style={styles.filtersScroll}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filtersScrollContent}
                        >
                            {filterOptions.map((filter) => (
                                <TouchableOpacity
                                    key={filter.id}
                                    style={[
                                        styles.filterItem,
                                        selectedFilter.id === filter.id && styles.selectedFilterItem
                                    ]}
                                    onPress={() => handleFilterSelect(filter)}
                                >
                                    <View style={styles.filterPreview}>
                                        <Image 
                                            source={{ uri: content.uri }} 
                                            style={[
                                                styles.filterPreviewImage,
                                                filter.style.tintColor && { tintColor: filter.style.tintColor }
                                            ]}
                                            resizeMode="cover"
                                        />
                                        {filter.style.tintColor && (
                                            <View style={[
                                                styles.filterPreviewOverlay,
                                                { backgroundColor: filter.style.tintColor }
                                            ]} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.filterName,
                                        selectedFilter.id === filter.id && styles.selectedFilterName
                                    ]}>
                                        {filter.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

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
                            multiline
                            onSubmitEditing={(e) => handleAddText(e.nativeEvent.text)}
                            blurOnSubmit={true}
                            autoFocus={true}
                        />
                    </View>
                )}

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

                <View style={styles.shareContainer}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => handleShare('your_stories')}
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
                                <Text style={styles.shareButtonText}>Your stories</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.shareButton, styles.closeFriendsButton]}
                        onPress={() => handleShare('close_friends')}
                        disabled={isUploading}
                    >
                        <View style={styles.shareButtonContent}>
                            <MaterialIcons name="stars" size={24} color="white" />
                            <Text style={styles.shareButtonText}>Close Friends</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => handleShare('send')}
                        disabled={isUploading}
                    >
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Custom Modal for showing success/error messages */}
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
    filterOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    textOverlay: {
        position: 'absolute',
        minWidth: 100,
        minHeight: 40,
        justifyContent: 'center',
        alignItems: 'center',
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
    filtersContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: 200,
    },
    filtersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    filtersCloseButton: {
        padding: 5,
    },
    filtersTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    filtersScroll: {
        paddingLeft: 20,
    },
    filtersScrollContent: {
        paddingRight: 20,
    },
    filterItem: {
        alignItems: 'center',
        marginRight: 15,
    },
    selectedFilterItem: {
        transform: [{ scale: 1.1 }],
    },
    filterPreview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
        position: 'relative',
    },
    filterPreviewImage: {
        width: '100%',
        height: '100%',
    },
    filterPreviewOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    filterName: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
    },
    selectedFilterName: {
        color: 'white',
        fontWeight: 'bold',
    },
    textInputContainer: {
        position: 'absolute',
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    textInput: {
        width: '80%',
        textAlign: 'center',
    },
    textOptionsContainer: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
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
    captionContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
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
    closeFriendsButton: {
        backgroundColor: 'green',
    },
    sendButton: {
        backgroundColor: 'blue',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
});

export default StoryEditorScreen;