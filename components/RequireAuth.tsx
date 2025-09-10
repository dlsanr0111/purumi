import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  fallback 
}) => {
  const { session, isGuest, loading } = useAuth();
  const router = useRouter();

  // 로딩 중일 때
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  // 인증되지 않은 경우
  if (!session && !isGuest) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>로그인이 필요합니다</Text>
          <Text style={styles.description}>
            이 기능을 사용하려면 로그인하거나 회원가입해주세요.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.push('/sign-in')}
            >
              <Text style={styles.primaryButtonText}>로그인</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push('/sign-up')}
            >
              <Text style={styles.secondaryButtonText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // 인증된 경우 또는 게스트인 경우
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    padding: Layout.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: Layout.spacing.md,
  },
  button: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  primaryButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  secondaryButtonText: {
    color: Colors.primary[500],
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
});
