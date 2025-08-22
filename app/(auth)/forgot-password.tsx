import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  // Current step state
  const [currentStep, setCurrentStep] = useState<Step>('email');
  
  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // OTP input refs
  const otpRefs = useRef<TextInput[]>([]);

  // Validation functions
  const validateEmail = () => {
    const newErrors: any = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors: any = {};
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit OTP';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswords = () => {
    // Clear all previous errors first
    const newErrors: any = {};
    
    // Ensure passwords are strings and get clean versions
    const pwd1 = String(newPassword || '').trim();
    const pwd2 = String(confirmPassword || '').trim();
    
    // Validate new password
    if (pwd1.length === 0) {
      newErrors.newPassword = 'New password is required';
    } else if (pwd1.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    // Validate confirm password
    if (pwd2.length === 0) {
      newErrors.confirmPassword = 'Please confirm your password';
    }
    
    // Check if passwords match (only if both exist)
    if (pwd1.length > 0 && pwd2.length > 0) {
      if (pwd1 !== pwd2) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step handlers
  const handleSendOtp = async () => {
    if (!validateEmail()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://social-backend-y1rg.onrender.com/user/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setCurrentStep('otp');
      startResendTimer();

      Alert.alert(
        'OTP Sent',
        `A 6-digit verification code has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;
    
    setIsLoading(true);
    try {
      const otpString = otp.join('');

      const response = await fetch('https://social-backend-y1rg.onrender.com/user/verifyForgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp: otpString })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      setCurrentStep('reset');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    
    setIsLoading(true);
    try {
      // Validate inputs
      if (!email || !newPassword || !confirmPassword) {
        throw new Error('Email and passwords are required');
      }
      
      // Ensure passwords are clean strings
      const cleanEmail = String(email).trim();
      const cleanNewPassword = String(newPassword).trim();
      const cleanConfirmPassword = String(confirmPassword).trim();
      
      // Additional validation
      if (cleanEmail.length === 0) {
        throw new Error('Email cannot be empty');
      }
      if (cleanNewPassword.length === 0) {
        throw new Error('New password cannot be empty');
      }
      if (cleanConfirmPassword.length === 0) {
        throw new Error('Confirm password cannot be empty');
      }
      if (cleanNewPassword !== cleanConfirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const requestBody = {
        email: cleanEmail,
        password: cleanNewPassword,
        confirmPassword: cleanConfirmPassword
      };
      
     
      
      const response = await fetch('https://social-backend-y1rg.onrender.com/user/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated successfully. You can now login with your new password.',
        [
          {
            text: 'Login Now',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://social-backend-y1rg.onrender.com/user/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      
      startResendTimer();
      Alert.alert('OTP Resent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const goBack = () => {
    if (currentStep === 'email') {
      router.back();
    } else if (currentStep === 'otp') {
      setCurrentStep('email');
    } else {
      setCurrentStep('otp');
    }
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'email':
        return {
          title: 'Forgot Password?',
          subtitle: 'Enter your registered email address and we\'ll send you a verification code',
          icon: <Mail size={32} color={Colors.dark.primary} />
        };
      case 'otp':
        return {
          title: 'Verify OTP',
          subtitle: `Enter the 6-digit verification code sent to ${email}`,
          icon: <Shield size={32} color={Colors.dark.primary} />
        };
      case 'reset':
        return {
          title: 'Reset Password',
          subtitle: 'Create a new secure password for your account',
          icon: <Lock size={32} color={Colors.dark.primary} />
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goBack}
            >
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            
            <View style={styles.stepIndicator}>
              <View style={styles.iconContainer}>
                {stepInfo.icon}
              </View>
              <Text style={styles.title}>{stepInfo.title}</Text>
              <Text style={styles.subtitle}>{stepInfo.subtitle}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: currentStep === 'email' ? '33%' : 
                           currentStep === 'otp' ? '66%' : '100%' 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep === 'email' ? '1' : currentStep === 'otp' ? '2' : '3'} of 3
            </Text>
          </View>

          {/* Content */}
          <Card style={styles.formCard}>
            {currentStep === 'email' && (
              <View style={styles.stepContent}>
                <Input
                  label="Email Address"
                  placeholder="Enter your registered email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={20} color={Colors.dark.subtext} />}
                  error={errors.email}
                />
                
                <Button
                  title="Send Verification Code"
                  onPress={handleSendOtp}
                  isLoading={isLoading}
                  gradient
                  rightIcon={<ArrowRight size={20} color="#fff" />}
                  style={styles.actionButton}
                />
              </View>
            )}

            {currentStep === 'otp' && (
              <View style={styles.stepContent}>
                <View style={styles.otpContainer}>
                  <Text style={styles.otpLabel}>Enter Verification Code</Text>
                  <View style={styles.otpInputContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpRefs.current[index] = ref!)}
                        style={[
                          styles.otpInput,
                          digit && styles.otpInputFilled,
                          errors.otp && styles.otpInputError
                        ]}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                        keyboardType="numeric"
                        maxLength={1}
                        textAlign="center"
                        placeholderTextColor={Colors.dark.subtext}
                      />
                    ))}
                  </View>
                  {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                </View>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive the code?</Text>
                  <TouchableOpacity 
                    onPress={handleResendOtp}
                    disabled={resendTimer > 0 || isLoading}
                    style={styles.resendButton}
                  >
                    <Text style={[
                      styles.resendButtonText,
                      (resendTimer > 0 || isLoading) && styles.resendButtonDisabled
                    ]}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Button
                  title="Verify Code"
                  onPress={handleVerifyOtp}
                  isLoading={isLoading}
                  gradient
                  rightIcon={<CheckCircle size={20} color="#fff" />}
                  style={styles.actionButton}
                />
              </View>
            )}

            {currentStep === 'reset' && (
              <View style={styles.stepContent}>
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(text) => {
                    // Ensure clean string input
                    const cleanText = String(text || '').replace(/[\r\n\t]/g, '');
                    setNewPassword(cleanText);
                    // Clear errors when user starts typing
                    if (errors.newPassword || errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, newPassword: undefined, confirmPassword: undefined }));
                    }
                  }}
                  isPassword
                  leftIcon={<Lock size={20} color={Colors.dark.subtext} />}
                  error={errors.newPassword}
                />
                
                <Input
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    // Ensure clean string input
                    const cleanText = String(text || '').replace(/[\r\n\t]/g, '');
                    setConfirmPassword(cleanText);
                    // Clear confirm password error when user starts typing
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  isPassword
                  leftIcon={<Lock size={20} color={Colors.dark.subtext} />}
                  error={errors.confirmPassword}
                />
                
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <Text style={styles.requirementItem}>• At least 8 characters long</Text>
                  <Text style={styles.requirementItem}>• Mix of letters and numbers</Text>
                  <Text style={styles.requirementItem}>• At least one special character</Text>
                </View>
                
                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  isLoading={isLoading}
                  gradient
                  rightIcon={<CheckCircle size={20} color="#fff" />}
                  style={styles.actionButton}
                />
              </View>
            )}
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember your password?
            </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    padding: 8,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  formCard: {
    padding: 24,
    marginBottom: 24,
  },
  stepContent: {
    width: '100%',
  },
  actionButton: {
    marginTop: 24,
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
    marginBottom: 12,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  otpInputFilled: {
    borderColor: Colors.dark.primary,
  },
  otpInputError: {
    borderColor: Colors.dark.error,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  resendText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 8,
  },
  resendButton: {
    padding: 4,
  },
  resendButtonText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: Colors.dark.subtext,
  },
  passwordRequirements: {
    backgroundColor: Colors.dark.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  requirementsTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    color: Colors.dark.subtext,
    fontSize: 13,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    color: Colors.dark.subtext,
    marginRight: 4,
  },
  loginText: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: 4,
  },
});
