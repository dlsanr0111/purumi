import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export default function SignUpScreen() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  // 이메일 중복 체크
  const checkEmailDuplicate = async (email: string): Promise<boolean> => {
    try {
      // Supabase에서 이메일 중복 체크
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data; // 데이터가 있으면 중복
    } catch (error) {
      console.error('이메일 중복 체크 실패:', error);
      return false; // 에러 시 중복이 아닌 것으로 처리
    }
  };

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  // 이메일 단계 처리
  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);
    setEmailError('');

    try {
      const isDuplicate = await checkEmailDuplicate(email);
      
      if (isDuplicate) {
        setEmailError('이미 사용 중인 이메일입니다.');
        setLoading(false);
        return;
      }

      // 이메일이 유효하면 비밀번호 단계로
      setStep('password');
    } catch (error) {
      console.error('이메일 체크 에러:', error);
      Alert.alert('오류', '이메일 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 단계 처리
  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setPasswordError('');

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        let errorMessage = '회원가입에 실패했습니다.';
        
        if (error.message.includes('User already registered')) {
          errorMessage = '이미 등록된 이메일입니다.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = '비밀번호는 8자 이상이어야 합니다.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '올바른 이메일 형식이 아닙니다.';
        } else if (error.message.includes('Signup is disabled')) {
          errorMessage = '현재 회원가입이 비활성화되어 있습니다.';
        }
        
        Alert.alert('회원가입 실패', errorMessage);
      } else {
        Alert.alert(
          '회원가입 성공',
          '회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.',
          [
            {
              text: '확인',
              onPress: () => router.replace('/sign-in'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setPassword('');
    setPasswordConfirm('');
    setPasswordError('');
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            {step === 'email' ? '이메일을 입력해주세요' : '비밀번호를 설정해주세요'}
          </Text>
        </View>

        {/* 이메일 단계 */}
        {step === 'email' && (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setEmailError('');
                }}
                placeholder="이메일을 입력하세요"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleEmailSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.primaryButtonText}>다음</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 비밀번호 단계 */}
        {step === 'password' && (
          <View style={styles.formContainer}>
            <View style={styles.emailDisplay}>
              <Text style={styles.emailLabel}>이메일</Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setPasswordError('');
                  }}
                  placeholder="비밀번호를 입력하세요 (8자 이상)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={[styles.input, passwordError && styles.inputError]}
                value={passwordConfirm}
                onChangeText={(value) => {
                  setPasswordConfirm(value);
                  setPasswordError('');
                }}
                placeholder="비밀번호를 다시 입력하세요"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleBackToEmail}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>이전</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handlePasswordSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.text.inverse} />
                ) : (
                  <Text style={styles.primaryButtonText}>회원가입</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 하단 링크 */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: Layout.spacing.xl,
  },
  inputContainer: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  inputError: {
    borderColor: Colors.error[500],
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: Layout.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  passwordToggleText: {
    fontSize: Layout.fontSize.md,
  },
  emailDisplay: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginBottom: Layout.spacing.lg,
  },
  emailLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xs,
  },
  emailText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  button: {
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
    marginBottom: Layout.spacing.md,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginRight: Layout.spacing.sm,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.text.primary,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  linkText: {
    color: Colors.primary[500],
    fontSize: Layout.fontSize.sm,
  },
  errorText: {
    color: Colors.error[500],
    fontSize: Layout.fontSize.xs,
    marginTop: Layout.spacing.xs,
  },
});