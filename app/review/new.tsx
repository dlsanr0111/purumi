import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { RatingStars } from '../../components/RatingStars';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { mockClinics, Clinic } from '../../lib/mock';

export default function ReviewNewScreen() {
  const { clinicId } = useLocalSearchParams<{ clinicId: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'ko' | 'en' | 'ja' | 'zh'>('ko');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ] as const;

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 클리닉 데이터 로드
    loadClinicData();
  }, [clinicId]);

  const loadClinicData = async () => {
    try {
      const foundClinic = mockClinics.find(c => c.id === clinicId);
      setClinic(foundClinic || null);
    } catch (error) {
      console.error('클리닉 데이터 로드 실패:', error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('알림', '별점을 선택해주세요.');
      return;
    }

    if (reviewText.trim().length === 0) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 실제로는 API 호출
      console.log('리뷰 제출:', {
        clinicId,
        rating,
        text: reviewText,
        language: selectedLanguage,
      });

      // 성공 시 클리닉 상세 페이지로 이동
      Alert.alert(
        '성공',
        '리뷰가 성공적으로 등록되었습니다.',
        [
          {
            text: '확인',
            onPress: () => router.push(`/clinics/${clinicId}`),
          },
        ]
      );
    } catch (error) {
      console.error('리뷰 제출 실패:', error);
      Alert.alert('오류', '리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!clinic) {
    return (
      <View style={styles.container}>
        <Header
          title="리뷰 작성"
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>클리닉 정보를 찾을 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="리뷰 작성"
        showBack
        onBackPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        {/* 클리닉 정보 */}
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <Text style={styles.clinicAddress}>{clinic.address}</Text>
        </View>

        {/* 별점 평가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>별점 평가</Text>
          <View style={styles.ratingContainer}>
            <RatingStars
              rating={rating}
              size="large"
              interactive
              onRatingChange={setRating}
            />
            <Text style={styles.ratingText}>
              {rating > 0 ? `${rating}점` : '별점을 선택해주세요'}
            </Text>
          </View>
        </View>

        {/* 언어 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리뷰 언어</Text>
          <View style={styles.languageContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang.code && styles.selectedLanguageButton,
                ]}
                onPress={() => setSelectedLanguage(lang.code)}
                accessibilityRole="button"
                accessibilityLabel={`${lang.name} 선택`}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === lang.code && styles.selectedLanguageName,
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 리뷰 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리뷰 내용</Text>
          <TextInput
            style={styles.textInput}
            placeholder="시술 경험을 자세히 알려주세요..."
            placeholderTextColor={Colors.text.tertiary}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            accessibilityLabel="리뷰 내용 입력"
          />
          <Text style={styles.characterCount}>
            {reviewText.length} / 500자
          </Text>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeTitle}>📝 리뷰 작성 안내</Text>
          <Text style={styles.noticeText}>
            • 솔직하고 구체적인 경험을 공유해주세요{'\n'}
            • 개인정보나 의료진 개인명은 기재하지 마세요{'\n'}
            • 다른 사용자에게 도움이 되는 정보를 작성해주세요
          </Text>
        </View>
      </ScrollView>

      {/* 하단 제출 버튼 */}
      <View style={styles.bottomContainer}>
        <Button
          title="리뷰 등록"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={rating === 0 || reviewText.trim().length === 0}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: Layout.fontSize.lg,
    color: Colors.text.secondary,
  },
  clinicInfo: {
    backgroundColor: Colors.background.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  clinicName: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  clinicAddress: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.background.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.sm,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageButton: {
    flex: 1,
    alignItems: 'center',
    padding: Layout.spacing.md,
    marginHorizontal: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
  },
  selectedLanguageButton: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  languageFlag: {
    fontSize: Layout.fontSize.xl,
    marginBottom: Layout.spacing.xs,
  },
  languageName: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  selectedLanguageName: {
    color: Colors.primary[700],
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
    minHeight: 120,
  },
  characterCount: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'right',
    marginTop: Layout.spacing.sm,
  },
  noticeContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  noticeTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.primary[700],
    marginBottom: Layout.spacing.sm,
  },
  noticeText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary[600],
    lineHeight: 20,
  },
  bottomContainer: {
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  submitButton: {
    minHeight: Layout.touchTarget,
  },
});


