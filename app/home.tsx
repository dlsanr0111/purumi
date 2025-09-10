import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function HomeScreen() {
  const { user, isGuest, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleReservation = () => {
    router.push('/reservation');
  };

  const handleShorts = () => {
    router.push('/shorts');
  };

  const handleClinics = () => {
    router.push('/clinics');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>Purumi</Text>
          <Text style={styles.subtitle}>
            {isGuest ? '게스트 모드' : user?.email ? `안녕하세요, ${user.email}님!` : '환영합니다!'}
          </Text>
        </View>

        {/* 메인 기능들 */}
        <View style={styles.features}>
          <TouchableOpacity style={styles.featureCard} onPress={handleShorts}>
            <Text style={styles.featureIcon}>📺</Text>
            <Text style={styles.featureTitle}>Shorts</Text>
            <Text style={styles.featureDescription}>뷰티 관련 영상 시청</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={handleClinics}>
            <Text style={styles.featureIcon}>🏥</Text>
            <Text style={styles.featureTitle}>병원 찾기</Text>
            <Text style={styles.featureDescription}>주변 뷰티 클리닉 검색</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, styles.reservationCard]} 
            onPress={handleReservation}
          >
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>예약하기</Text>
            <Text style={styles.featureDescription}>
              {isGuest ? '로그인 후 예약 가능' : '서비스 예약'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 게스트 모드 안내 */}
        {isGuest && (
          <View style={styles.guestInfo}>
            <Text style={styles.guestInfoTitle}>게스트 모드</Text>
            <Text style={styles.guestInfoText}>
              현재 게스트 모드로 이용 중입니다. 예약 기능을 사용하려면 로그인해주세요.
            </Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/sign-in')}
            >
              <Text style={styles.loginButtonText}>로그인하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 로그아웃 버튼 (로그인된 사용자만) */}
        {!isGuest && user && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
    paddingTop: Layout.spacing.xl,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '700',
    color: Colors.primary[500],
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  features: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  featureCard: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  reservationCard: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: Layout.spacing.sm,
  },
  featureTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  featureDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  guestInfo: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginBottom: Layout.spacing.lg,
  },
  guestInfoTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.sm,
  },
  guestInfoText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  loginButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: 'transparent',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error[500],
  },
  signOutButtonText: {
    color: Colors.error[500],
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
});
