import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Shield,
  Star
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';

export default function PremiumScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleTryFree = () => {
    // Handle premium subscription
    alert('Premium trial activated!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Premium',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={Colors.dark.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Crown size={40} color="#fff" />
          <Text style={styles.headerTitle}>ConnektX Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock the full potential of your professional network
          </Text>
        </LinearGradient>
        
        <View style={styles.offerContainer}>
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>Limited Time Offer</Text>
          </View>
          <Text style={styles.offerTitle}>Try Premium for ₹0</Text>
          <Text style={styles.offerDescription}>
            Get 1 month free trial, then ₹799/month. Cancel anytime.
          </Text>
          
          <Button
            title="Start My Free Trial"
            onPress={handleTryFree}
            gradient
            style={styles.trialButton}
          />
          
          <Text style={styles.offerTerms}>
            By starting your free trial, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Benefits</Text>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <TrendingUp size={24} color={Colors.dark.tint} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Advanced Analytics</Text>
              <Text style={styles.benefitDescription}>
                Get detailed insights about your profile views, post engagement, and audience demographics.
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Users size={24} color={Colors.dark.tint} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Enhanced Networking</Text>
              <Text style={styles.benefitDescription}>
                See who viewed your profile and connect with industry leaders without restrictions.
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <MessageCircle size={24} color={Colors.dark.tint} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Priority Support</Text>
              <Text style={styles.benefitDescription}>
                Get faster responses and dedicated support for all your questions and issues.
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Shield size={24} color={Colors.dark.tint} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Ad-Free Experience</Text>
              <Text style={styles.benefitDescription}>
                Enjoy a clean, distraction-free experience without any advertisements.
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compare Plans</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plansContainer}
          >
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Free</Text>
              <Text style={styles.planPrice}>₹0</Text>
              <Text style={styles.planPeriod}>forever</Text>
              
              <View style={styles.planFeatures}>
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>Basic profile</Text>
                </View>
                
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>Connect with others</Text>
                </View>
                
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>Join communities</Text>
                </View>
                
                <View style={[styles.planFeatureItem, styles.featureDisabled]}>
                  <Check size={16} color={Colors.dark.border} />
                  <Text style={styles.planFeatureTextDisabled}>Advanced analytics</Text>
                </View>
                
                <View style={[styles.planFeatureItem, styles.featureDisabled]}>
                  <Check size={16} color={Colors.dark.border} />
                  <Text style={styles.planFeatureTextDisabled}>Ad-free experience</Text>
                </View>
              </View>
              
              <Button
                title="Current Plan"
                variant="outline"
                style={styles.planButton}
                disabled
              />
            </View>
            
            <View style={styles.planCardPremium}>
              <LinearGradient
                colors={Colors.dark.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.planBadge}
              >
                <Star size={12} color="#fff" />
                <Text style={styles.planBadgeText}>RECOMMENDED</Text>
              </LinearGradient>
              
              <Text style={styles.planTitlePremium}>Premium</Text>
              <Text style={styles.planPricePremium}>₹799</Text>
              <Text style={styles.planPeriodPremium}>per month</Text>
              
              <View style={styles.planFeatures}>
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>Everything in Free</Text>
                </View>
                
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>Advanced analytics</Text>
                </View>
                
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>See who viewed your profile</Text>
                </View>
                
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>Priority support</Text>
                </View>
                
                <View style={styles.planFeatureItem}>
                  <Check size={16} color={Colors.dark.success} />
                  <Text style={styles.planFeatureText}>Ad-free experience</Text>
                </View>
              </View>
              
              <Button
                title="Start Free Trial"
                gradient
                style={styles.planButton}
                onPress={handleTryFree}
              />
            </View>
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>
          
          <View style={styles.testimonialCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }} 
              style={styles.testimonialImage} 
            />
            <Text style={styles.testimonialContent}>
              "Premium has been a game-changer for my professional growth. The analytics helped me understand my audience better and create more engaging content."
            </Text>
            <Text style={styles.testimonialAuthor}>Maya Johnson</Text>
            <Text style={styles.testimonialRole}>UX Designer</Text>
          </View>
          
          <View style={styles.testimonialCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }} 
              style={styles.testimonialImage} 
            />
            <Text style={styles.testimonialContent}>
              "The networking features in Premium helped me connect with industry leaders and find new opportunities. Definitely worth the investment!"
            </Text>
            <Text style={styles.testimonialAuthor}>Raj Patel</Text>
            <Text style={styles.testimonialRole}>Product Manager</Text>
          </View>
        </View>
        
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              How does the free trial work?
            </Text>
            <Text style={styles.faqAnswer}>
              You'll get full access to all Premium features for 1 month. You won't be charged until the trial ends, and you can cancel anytime.
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Can I cancel my subscription?
            </Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. If you cancel during your free trial, you won't be charged.
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              What payment methods do you accept?
            </Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards, debit cards, and UPI payments.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  offerContainer: {
    backgroundColor: Colors.dark.card,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  offerBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.dark.warning,
    borderRadius: 100,
  },
  offerBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  offerTitle: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  offerDescription: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 20,
  },
  trialButton: {
    width: '100%',
    marginBottom: 16,
  },
  offerTerms: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.dark.tint}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefitDescription: {
    color: Colors.dark.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  plansContainer: {
    paddingBottom: 16,
  },
  planCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    width: 280,
    marginRight: 16,
  },
  planCardPremium: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    width: 280,
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -80,
    width: 160,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  planTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  planTitlePremium: {
    color: Colors.dark.tint,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  planPrice: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  planPricePremium: {
    color: Colors.dark.tint,
    fontSize: 28,
    fontWeight: 'bold',
  },
  planPeriod: {
    color: Colors.dark.subtext,
    marginBottom: 16,
  },
  planPeriodPremium: {
    color: Colors.dark.tint,
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 20,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDisabled: {
    opacity: 0.5,
  },
  planFeatureText: {
    color: Colors.dark.text,
    marginLeft: 8,
  },
  planFeatureTextDisabled: {
    color: Colors.dark.subtext,
    marginLeft: 8,
  },
  planButton: {
    width: '100%',
  },
  testimonialCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  testimonialImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  testimonialContent: {
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialAuthor: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  testimonialRole: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  faqSection: {
    padding: 16,
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    color: Colors.dark.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
});