import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface SignupData {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  isHospitalAccount: boolean;
  interestedAreas: string[];
}

interface NewSignupFormProps {
  onComplete: (data: SignupData) => void;
  onBack: () => void;
  onShowCelebration: () => void;
}

const AREAS = [
  { id: '1', name: '눈', icon: '👁️', description: '눈가 주름, 다크서클' },
  { id: '2', name: '코', icon: '👃', description: '코끝, 콧대, 콧볼' },
  { id: '3', name: '입', icon: '👄', description: '입술, 입꼬리, 입가' },
  { id: '4', name: '볼', icon: '😊', description: '볼살, 볼 처짐' },
  { id: '5', name: '턱선', icon: '🦴', description: '턱선, 목선' },
  { id: '6', name: '이마', icon: '🤔', description: '이마 주름, 볼륨' },
  { id: '7', name: '목', icon: '🦒', description: '목 주름, 목선' },
  { id: '8', name: '팔', icon: '💪', description: '팔뚝, 팔꿈치' },
  { id: '9', name: '다리', icon: '🦵', description: '허벅지, 종아리' },
  { id: '10', name: '배', icon: '🤰', description: '복부, 옆구리' },
  { id: '11', name: '등', icon: '🫁', description: '등, 어깨' },
];

export default function NewSignupForm({ onComplete, onBack, onShowCelebration }: NewSignupFormProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SignupData>({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthYear: '1990',
    birthMonth: '01',
    birthDay: '01',
    isHospitalAccount: false,
    interestedAreas: [],
  });

  const updateData = (field: keyof SignupData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 생년월일 피커를 위한 헬퍼 함수들
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear; year++) {
      years.push(year.toString());
    }
    return years.reverse();
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => 
      (i + 1).toString().padStart(2, '0')
    );
  };

  const generateDays = (year: string, month: string) => {
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => 
      (i + 1).toString().padStart(2, '0')
    );
  };

  const nextStep = () => {
    if (step < 8) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    // 축하 페이지로 이동
    onShowCelebration();
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>이메일을 입력해주세요</Text>
      <Text style={styles.stepSubtitle}>회원가입에 필요한 이메일 주소를 입력해주세요</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={data.email}
          onChangeText={(value) => updateData('email', value)}
        />
      </View>
      
      {data.email.length > 0 && !validateEmail(data.email) && (
        <Text style={styles.errorText}>올바른 이메일 형식이 아닙니다</Text>
      )}
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          data.email.length === 0 || !validateEmail(data.email) ? styles.nextButtonDisabled : null
        ]}
        onPress={nextStep}
        disabled={data.email.length === 0 || !validateEmail(data.email)}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>이메일 인증</Text>
      <Text style={styles.stepSubtitle}>
        {data.email}로 전송된 인증 코드를 입력해주세요
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>인증 코드</Text>
        <TextInput
          style={styles.input}
          placeholder="6자리 인증 코드를 입력하세요"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          maxLength={6}
          value={data.verificationCode}
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9]/g, '');
            updateData('verificationCode', numericValue);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <TouchableOpacity style={styles.resendButton}>
        <Text style={styles.resendButtonText}>인증 코드 재전송</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          data.verificationCode.length !== 6 ? styles.nextButtonDisabled : null
        ]}
        onPress={nextStep}
        disabled={data.verificationCode.length !== 6}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>비밀번호 설정</Text>
      <Text style={styles.stepSubtitle}>안전한 비밀번호를 설정해주세요</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>비밀번호</Text>
        <TextInput
          key="password-input"
          style={styles.input}
          placeholder="비밀번호를 입력하세요 (8자 이상)"
          placeholderTextColor="#9ca3af"
          secureTextEntry={true}
          value={data.password}
          onChangeText={(value) => updateData('password', value)}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>비밀번호 확인</Text>
        <TextInput
          key="confirm-password-input"
          style={styles.input}
          placeholder="비밀번호를 다시 입력하세요"
          placeholderTextColor="#9ca3af"
          secureTextEntry={true}
          value={data.confirmPassword}
          onChangeText={(value) => updateData('confirmPassword', value)}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      {data.confirmPassword.length > 0 && data.password !== data.confirmPassword && (
        <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
      )}
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          data.password.length === 0 || 
          data.confirmPassword.length === 0 || 
          data.password !== data.confirmPassword ? styles.nextButtonDisabled : null
        ]}
        onPress={nextStep}
        disabled={
          data.password.length === 0 || 
          data.confirmPassword.length === 0 || 
          data.password !== data.confirmPassword
        }
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>이름을 입력해주세요</Text>
      <Text style={styles.stepSubtitle}>실명을 입력해주세요</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder="이름을 입력하세요"
          placeholderTextColor="#9ca3af"
          value={data.name}
          onChangeText={(value) => updateData('name', value)}
        />
      </View>
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          data.name.length === 0 ? styles.nextButtonDisabled : null
        ]}
        onPress={nextStep}
        disabled={data.name.length === 0}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>생년월일을 선택해주세요</Text>
      <Text style={styles.stepSubtitle}>스크롤하여 생년월일을 선택해주세요</Text>
      
      <View style={styles.pickerContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>년도</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={data.birthYear}
              onValueChange={(value) => {
                updateData('birthYear', value);
                // 년도가 변경되면 일자도 재계산
                const days = generateDays(value, data.birthMonth);
                if (!days.includes(data.birthDay)) {
                  updateData('birthDay', days[0]);
                }
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              numberOfLines={3}
            >
              {generateYears().map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>월</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={data.birthMonth}
              onValueChange={(value) => {
                updateData('birthMonth', value);
                // 월이 변경되면 일자도 재계산
                const days = generateDays(data.birthYear, value);
                if (!days.includes(data.birthDay)) {
                  updateData('birthDay', days[0]);
                }
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              numberOfLines={3}
            >
              {generateMonths().map((month) => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>일</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={data.birthDay}
              onValueChange={(value) => updateData('birthDay', value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              numberOfLines={3}
            >
              {generateDays(data.birthYear, data.birthMonth).map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>
          선택된 생년월일: {data.birthYear}년 {data.birthMonth}월 {data.birthDay}일
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={nextStep}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>병원 계정인가요?</Text>
      <Text style={styles.stepSubtitle}>병원 관계자이신가요?</Text>
      
      <TouchableOpacity 
        style={[
          styles.checkboxContainer,
          data.isHospitalAccount ? styles.checkboxSelected : null
        ]}
        onPress={() => updateData('isHospitalAccount', !data.isHospitalAccount)}
      >
        <Text style={styles.checkboxText}>
          {data.isHospitalAccount ? '✓' : ''} 병원 계정입니다
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={nextStep}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>입력 내용 확인</Text>
      <Text style={styles.stepSubtitle}>입력하신 정보를 확인해주세요</Text>
      
      <View style={styles.confirmContainer}>
        <View style={styles.confirmItem}>
          <Text style={styles.confirmLabel}>이메일</Text>
          <Text style={styles.confirmValue}>{data.email}</Text>
        </View>
        <View style={styles.confirmItem}>
          <Text style={styles.confirmLabel}>이름</Text>
          <Text style={styles.confirmValue}>{data.name}</Text>
        </View>
        <View style={styles.confirmItem}>
          <Text style={styles.confirmLabel}>생년월일</Text>
          <Text style={styles.confirmValue}>{data.birthYear}년 {data.birthMonth}월 {data.birthDay}일</Text>
        </View>
        <View style={styles.confirmItem}>
          <Text style={styles.confirmLabel}>계정 유형</Text>
          <Text style={styles.confirmValue}>
            {data.isHospitalAccount ? '병원 계정' : '일반 계정'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={nextStep}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep8 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>관심 부위를 선택해주세요</Text>
      <Text style={styles.stepSubtitle}>관심 있는 부위를 선택해주세요 (중복 선택 가능)</Text>
      
      <View style={styles.areasGrid}>
        {AREAS.map((area) => {
          const isSelected = data.interestedAreas.includes(area.id);
          return (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.areaCard,
                isSelected ? styles.areaCardSelected : null
              ]}
              onPress={() => {
                const newAreas = isSelected 
                  ? data.interestedAreas.filter(id => id !== area.id)
                  : [...data.interestedAreas, area.id];
                updateData('interestedAreas', newAreas);
              }}
            >
              <Text style={styles.areaIcon}>{area.icon}</Text>
              <Text style={styles.areaName}>{area.name}</Text>
              <Text style={styles.areaDescription}>{area.description}</Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      <TouchableOpacity 
        style={styles.completeButton}
        onPress={handleComplete}
      >
        <Text style={styles.completeButtonText}>회원가입 완료</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      default: return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>회원가입</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{step}/8</Text>
        </View>
      </View>
      
      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${(step / 8) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  stepIndicator: {
    backgroundColor: '#88C8C3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stepText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progress: {
    height: 4,
    backgroundColor: '#e5e7eb',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#88C8C3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#88C8C3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  resendButtonText: {
    color: '#88C8C3',
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 40,
  },
  checkboxSelected: {
    borderColor: '#88C8C3',
    backgroundColor: '#f0fdfa',
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  confirmContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  confirmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  confirmLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  areaCard: {
    width: '31%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    minHeight: 100,
  },
  areaCardSelected: {
    borderColor: '#88C8C3',
    backgroundColor: '#f0fdfa',
  },
  areaIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  areaDescription: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#88C8C3',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#88C8C3',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
    minWidth: 100,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  pickerWrapper: {
    height: 150,
    width: '100%',
    borderRadius: 75,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    height: 150,
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 100,
  },
  pickerItem: {
    fontSize: 18,
    color: '#111827',
    textAlign: 'center',
    paddingHorizontal: 2,
    height: 50,
    lineHeight: 50,
    fontWeight: '600',
    opacity: 0.8,
  },
  selectedDateContainer: {
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#88C8C3',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#88C8C3',
    textAlign: 'center',
  },
  pickerFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'white',
    opacity: 0.8,
    pointerEvents: 'none',
  },
  pickerFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'white',
    opacity: 0.8,
    pointerEvents: 'none',
  },
});
