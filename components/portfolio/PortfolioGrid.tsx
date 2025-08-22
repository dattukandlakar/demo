import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import PortfolioCard from './PortfolioCard';
import CreatePortfolioCard from './CreatePortfolioCard';
import { PortfolioItem } from '@/store/portfolio-store';

interface PortfolioGridProps {
  items: PortfolioItem[];
  onItemPress: (item: PortfolioItem) => void;
  onCreatePress: () => void;
  onEditItem?: (item: PortfolioItem) => void;
  onDeleteItem?: (item: PortfolioItem) => void;
  showActions?: boolean;
}

const { width } = Dimensions.get('window');
const PADDING = 16;
const CARD_SPACING = 12;
const CARD_WIDTH = (width - PADDING * 2 - CARD_SPACING * 2) / 3;

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ 
  items, 
  onItemPress, 
  onCreatePress, 
  onEditItem, 
  onDeleteItem,
  showActions = true
}) => {
  // Sort portfolio items by creation date (newest first)
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || '1970-01-01').getTime();
    const dateB = new Date(b.createdAt || b.updatedAt || '1970-01-01').getTime();
    return dateB - dateA; // Newest first
  });

  // Create a special item for the create card
  const createCardItem = {
    id: 'create-portfolio-card',
    isCreateCard: true,
  };

  // Combine create card with sorted portfolio items (only show create card if showActions is true)
  const allItems = showActions ? [createCardItem, ...sortedItems] : sortedItems;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Calculate if this is the last item in a row (every 3rd item: 2, 5, 8, etc.)
    const isLastInRow = (index + 1) % 3 === 0;
    
    if (item.isCreateCard) {
      return (
        <View style={[styles.cardContainer, { width: CARD_WIDTH, marginRight: isLastInRow ? 0 : CARD_SPACING }]}>
          <CreatePortfolioCard onPress={onCreatePress} />
        </View>
      );
    }
    
    return (
      <View style={[styles.cardContainer, { width: CARD_WIDTH, marginRight: isLastInRow ? 0 : CARD_SPACING }]}>
        <PortfolioCard 
          item={item} 
          onPress={onItemPress}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          showActions={showActions}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={allItems}
        renderItem={renderItem}
        keyExtractor={(item) => 'isCreateCard' in item && item.isCreateCard ? 'create-card' : item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Let parent ScrollView handle scrolling
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: CARD_SPACING,
    paddingHorizontal: 0,
  },
  cardContainer: {
    // Width is set dynamically above
    // marginRight is handled dynamically in renderItem
  },
});

export default PortfolioGrid;
