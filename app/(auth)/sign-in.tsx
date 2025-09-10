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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, continueAsGuest } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const redirectPath = params.redirect as string || '/home';

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 로그인 처리
  const handleSignIn = async () => {
    // 입력 검증
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setEmailError('');
    setPasswordError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        let errorMessage = '로그인에 실패했습니다.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        }
        
        Alert.alert('로그인 실패', errorMessage);
      } else {
        // 로그인 성공 시 리다이렉트 경로로 이동
        router.replace(redirectPath);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    console.log('회원가입 페이지로 이동 중...');
    router.push('/sign-up');
  };

  const handleGuestMode = async () => {
    try {
      await continueAsGuest();
      router.replace(redirectPath);
    } catch (error) {
      console.error('게스트 모드 진입 실패:', error);
      Alert.alert('오류', '게스트 모드 진입에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>Purumi에 오신 것을 환영합니다</Text>
        </View>

        {/* 폼 */}
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
                placeholder="비밀번호를 입력하세요"
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
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.text.inverse} />
            ) : (
              <Text style={styles.primaryButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>회원가입</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 링크들 */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
            <Text style={styles.guestButtonText}>게스트로 계속하기</Text>
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
  button: {
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
    marginTop: Layout.spacing.sm,
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
    color: Colors.primary[500],
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  linkText: {
    color: Colors.primary[500],
    fontSize: Layout.fontSize.sm,
  },
  guestButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
  },
  guestButtonText: {
    color: Colors.text.secondary,
    fontSize: Layout.fontSize.sm,
  },
  errorText: {
    color: Colors.error[500],
    fontSize: Layout.fontSize.xs,
    marginTop: Layout.spacing.xs,
  },
});