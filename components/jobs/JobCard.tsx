import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Briefcase, DollarSign, Bookmark, Clock } from 'lucide-react-native';
import { Job } from '@/types';
import { useJobStore } from '@/store/job-store';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Colors from '@/constants/colors';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
  compact?: boolean;
  expired?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress, compact = false, expired = false }) => {
  const { bookmarkJob } = useJobStore();

  const handleBookmark = (e: any) => {
    e.stopPropagation();
    bookmarkJob(job.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        compact && styles.compactContainer,
        expired && styles.expiredContainer
      ]} 
      onPress={() => onPress(job)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: job.logo }} style={styles.logo} />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.role}>{job.role}</Text>
          <Text style={styles.company}>{job.company}</Text>
        </View>
        
        {!compact && (
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={handleBookmark}
          >
            <Bookmark 
              size={20} 
              color={job.isBookmarked ? Colors.dark.tint : Colors.dark.text}
              fill={job.isBookmarked ? Colors.dark.tint : 'transparent'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {!compact && (
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MapPin size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Briefcase size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>{job.type}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <DollarSign size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>{job.salary}</Text>
          </View>
        </View>
      )}
      
      {!compact && job.skills && job.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {job.skills.slice(0, 3).map((skill, index) => (
            <Badge 
              key={index}
              label={skill}
              variant="secondary"
              size="small"
              style={styles.skillBadge}
            />
          ))}
          {job.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{job.skills.length - 3}</Text>
          )}
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Clock size={14} color={Colors.dark.subtext} />
          <Text style={styles.postedTime}>
            {expired ? 'Expired' : `Posted ${formatDate(job.postedAt)}`}
          </Text>
        </View>
        
        {!compact && !expired && (
          <Button
            title="Apply Now"
            onPress={() => onPress(job)}
            size="small"
            style={styles.applyButton}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compactContainer: {
    padding: 12,
  },
  expiredContainer: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  titleContainer: {
    flex: 1,
  },
  role: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  company: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  moreSkills: {
    color: Colors.dark.subtext,
    fontSize: 12,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postedTime: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginLeft: 6,
  },
  applyButton: {
    paddingHorizontal: 16,
  },
});

export default JobCard;