import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface CreatePortfolioCardProps {
  onPress: () => void;
}

const CreatePortfolioCard: React.FC<CreatePortfolioCardProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Plus Icon */}
      <View style={styles.iconContainer}>
        <Plus size={40} color={Colors.dark.primary} />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Add Portfolio
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        Create a new portfolio item
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    height: 180, // Fixed height to match PortfolioCard
    justifyContent: 'center',
    alignItems: 'center',
    // Modern gradient-like effect
    borderTopWidth: 3,
    borderTopColor: Colors.dark.primary,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    width: 60,
    height: 60,
    backgroundColor: Colors.dark.primary + '15',
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.primary,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 11,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.8,
  },
});

export default CreatePortfolioCard;
