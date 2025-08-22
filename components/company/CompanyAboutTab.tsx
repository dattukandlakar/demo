import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking 
} from 'react-native';
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Calendar, 
  Mail, 
  Phone,
  Info,
  ExternalLink
} from 'lucide-react-native';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { Company } from '@/store/company-store';

interface CompanyAboutTabProps {
  company: Company;
}

const CompanyAboutTab: React.FC<CompanyAboutTabProps> = ({ company }) => {
  const handleWebsitePress = () => {
    if (company.website) {
      Linking.openURL(company.website);
    }
  };
  
  const handleEmailPress = () => {
    if (company.email) {
      Linking.openURL(`mailto:${company.email}`);
    }
  };
  
  const handlePhonePress = () => {
    if (company.mobileNumber) {
      Linking.openURL(`tel:${company.mobileNumber}`);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.overviewCard}>
        <View style={styles.sectionHeader}>
          <Info size={20} color={Colors.dark.text} />
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>
        
        <Text style={styles.description}>
          {company.description || "No description provided."}
        </Text>
      </Card>
      
      <Card style={styles.detailsCard}>
        <View style={styles.sectionHeader}>
          <Building size={20} color={Colors.dark.text} />
          <Text style={styles.sectionTitle}>Company Details</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Industry</Text>
          <Text style={styles.detailValue}>
            {company.industry || "Not specified"}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Company Size</Text>
          <Text style={styles.detailValue}>
            0-10 employees
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Founded</Text>
          <Text style={styles.detailValue}>
            {new Date(company.createdAt).getFullYear()}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Headquarters</Text>
          <Text style={styles.detailValue}>
            {company.address || "Not specified"}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Company Type</Text>
          <Text style={styles.detailValue}>
            Private
          </Text>
        </View>
      </Card>
      
      <Card style={styles.contactCard}>
        <View style={styles.sectionHeader}>
          <Phone size={20} color={Colors.dark.text} />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>
        
        {company.website && (
          <TouchableOpacity 
            style={styles.contactRow}
            onPress={handleWebsitePress}
          >
            <View style={styles.contactIconContainer}>
              <Globe size={18} color={Colors.dark.tint} />
            </View>
            <Text style={styles.contactText}>{company.website}</Text>
            <ExternalLink size={16} color={Colors.dark.subtext} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.contactRow}
          onPress={handleEmailPress}
        >
          <View style={styles.contactIconContainer}>
            <Mail size={18} color={Colors.dark.tint} />
          </View>
          <Text style={styles.contactText}>{company.email}</Text>
          <ExternalLink size={16} color={Colors.dark.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactRow}
          onPress={handlePhonePress}
        >
          <View style={styles.contactIconContainer}>
            <Phone size={18} color={Colors.dark.tint} />
          </View>
          <Text style={styles.contactText}>{company.mobileNumber}</Text>
          <ExternalLink size={16} color={Colors.dark.subtext} />
        </TouchableOpacity>
        
        {company.address && (
          <View style={styles.contactRow}>
            <View style={styles.contactIconContainer}>
              <MapPin size={18} color={Colors.dark.tint} />
            </View>
            <Text style={styles.contactText}>{company.address}</Text>
          </View>
        )}
      </Card>
      
      <Card style={styles.ownerCard}>
        <View style={styles.sectionHeader}>
          <Users size={20} color={Colors.dark.text} />
          <Text style={styles.sectionTitle}>Company Management</Text>
        </View>
        
        <View style={styles.ownerRow}>
          <Text style={styles.ownerLabel}>Owner/Manager</Text>
          <Text style={styles.ownerName}>{company.ownerName}</Text>
        </View>
      </Card>
      
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  overviewCard: {
    padding: 16,
    marginBottom: 16,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 16,
  },
  contactCard: {
    padding: 16,
    marginBottom: 16,
  },
  ownerCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.dark.text,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 2,
    textAlign: 'right',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.dark.tint}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 1,
  },
  ownerRow: {
    paddingVertical: 12,
  },
  ownerLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  footer: {
    height: 40,
  },
});

export default CompanyAboutTab;