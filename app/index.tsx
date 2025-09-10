import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function IndexScreen() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Purumi</Text>
        <ActivityIndicator size="large" color={Colors.primary[500]} style={styles.loader} />
        <Text style={styles.subtitle}>로딩 중...</Text>
      </View>
    );
  }

  // AuthProvider에서 자동으로 라우팅 처리
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '700',
    color: Colors.primary[500],
    marginBottom: Layout.spacing.xl,
  },
  loader: {
    marginBottom: Layout.spacing.lg,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
  },
});
