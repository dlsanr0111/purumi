import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (data: AuthFormData) => Promise<void>;
  loading?: boolean;
  onSwitchMode: () => void;
  onGuestMode?: () => void;
}

export interface AuthFormData {
  email: string;
  password: string;
  passwordConfirm?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  user_type?: 'hospital' | 'personal';
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  loading = false,
  onSwitchMode,
  onGuestMode,
}) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    age: undefined,
    gender: undefined,
    user_type: undefined,
  });
  const [errors, setErrors] = useState<Partial<AuthFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<AuthFormData> = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    // 회원가입 시 추가 검증
    if (mode === 'signup') {
      if (!formData.passwordConfirm) {
        newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
      } else if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
      }

      if (formData.age && (formData.age < 0 || formData.age > 150)) {
        newErrors.age = '올바른 나이를 입력해주세요';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('폼 제출 실패:', error);
    }
  };

  const updateField = (field: keyof AuthFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 필드 업데이트 시 해당 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'signin' ? '로그인' : '회원가입'}
      </Text>

      {/* 이메일 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          placeholder="이메일을 입력하세요"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* 비밀번호 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="비밀번호를 입력하세요"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
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
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* 비밀번호 확인 (회원가입 시만) */}
      {mode === 'signup' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={[styles.input, errors.passwordConfirm && styles.inputError]}
            value={formData.passwordConfirm}
            onChangeText={(value) => updateField('passwordConfirm', value)}
            placeholder="비밀번호를 다시 입력하세요"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.passwordConfirm && <Text style={styles.errorText}>{errors.passwordConfirm}</Text>}
        </View>
      )}

      {/* 나이 (회원가입 시만) */}
      {mode === 'signup' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>나이 (선택사항)</Text>
          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            value={formData.age?.toString() || ''}
            onChangeText={(value) => updateField('age', parseInt(value) || 0)}
            placeholder="나이를 입력하세요"
            keyboardType="numeric"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>
      )}

      {/* 성별 (회원가입 시만) */}
      {mode === 'signup' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>성별 (선택사항)</Text>
          <View style={styles.genderContainer}>
            {(['male', 'female', 'other'] as const).map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderButton,
                  formData.gender === gender && styles.genderButtonSelected,
                ]}
                onPress={() => updateField('gender', gender)}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === gender && styles.genderButtonTextSelected,
                  ]}
                >
                  {gender === 'male' ? '남성' : gender === 'female' ? '여성' : '기타'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 사용자 타입 (회원가입 시만) */}
      {mode === 'signup' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>사용자 타입 (선택사항)</Text>
          <View style={styles.userTypeContainer}>
            {(['hospital', 'personal'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.userTypeButton,
                  formData.user_type === type && styles.userTypeButtonSelected,
                ]}
                onPress={() => updateField('user_type', type)}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    formData.user_type === type && styles.userTypeButtonTextSelected,
                  ]}
                >
                  {type === 'hospital' ? '병원' : '개인'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 제출 버튼 */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.text.inverse} />
        ) : (
          <Text style={styles.submitButtonText}>
            {mode === 'signin' ? '로그인' : '회원가입'}
          </Text>
        )}
      </TouchableOpacity>

      {/* 모드 전환 버튼 */}
      <TouchableOpacity style={styles.switchButton} onPress={onSwitchMode}>
        <Text style={styles.switchButtonText}>
          {mode === 'signin' ? '회원가입으로' : '로그인으로'}
        </Text>
      </TouchableOpacity>

      {/* 게스트 모드 버튼 (로그인 시만) */}
      {mode === 'signin' && onGuestMode && (
        <TouchableOpacity style={styles.guestButton} onPress={onGuestMode}>
          <Text style={styles.guestButtonText}>게스트로 계속하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
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
  genderContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  genderButtonText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.primary,
  },
  genderButtonTextSelected: {
    color: Colors.text.inverse,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  userTypeButtonSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  userTypeButtonText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.primary,
  },
  userTypeButtonTextSelected: {
    color: Colors.text.inverse,
  },
  submitButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  switchButtonText: {
    color: Colors.primary[500],
    fontSize: Layout.fontSize.sm,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
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
