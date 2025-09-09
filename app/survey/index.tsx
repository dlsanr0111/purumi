import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { problemAreas, ProblemArea } from '../../lib/mock';

export default function SurveyScreen() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [areas, setAreas] = useState<ProblemArea[]>([]);

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 데이터 로드
    setAreas(problemAreas);
  }, []);

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreas(prev => {
      if (prev.includes(areaId)) {
        // 이미 선택된 경우 제거
        return prev.filter(id => id !== areaId);
      } else if (prev.length < 5) {
        // 최대 5개까지만 선택 가능
        return [...prev, areaId];
      }
      return prev;
    });
  };

  const handleComplete = () => {
    // 선택된 부위를 기반으로 클리닉 필터링
    console.log('선택된 부위:', selectedAreas);
    router.push('/clinics');
  };

  const getAreaName = (areaId: string) => {
    return areas.find(area => area.id === areaId)?.name || '';
  };

  return (
    <View style={styles.container}>
      <Header
        title="문제 부위 선택"
        showBack
        onBackPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>관심 있는 부위를 선택해주세요</Text>
          <Text style={styles.subtitle}>
            최대 5개까지 선택할 수 있습니다 ({selectedAreas.length}/5)
          </Text>
        </View>

        <View style={styles.areasGrid}>
          {areas.map((area) => {
            const isSelected = selectedAreas.includes(area.id);
            return (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.areaCard,
                  isSelected && styles.selectedAreaCard,
                ]}
                onPress={() => handleAreaSelect(area.id)}
                accessibilityRole="button"
                accessibilityLabel={`${area.name} ${isSelected ? '선택됨' : '선택 안됨'}`}
              >
                <Text style={[
                  styles.areaIcon,
                  isSelected && styles.selectedAreaIcon,
                ]}>
                  {area.icon}
                </Text>
                <Text style={[
                  styles.areaName,
                  isSelected && styles.selectedAreaName,
                ]}>
                  {area.name}
                </Text>
                <Text style={[
                  styles.areaDescription,
                  isSelected && styles.selectedAreaDescription,
                ]}>
                  {area.description}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedAreas.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedTitle}>선택된 부위:</Text>
            <View style={styles.selectedTags}>
              {selectedAreas.map((areaId) => (
                <View key={areaId} style={styles.selectedTag}>
                  <Text style={styles.selectedTagText}>
                    {getAreaName(areaId)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleAreaSelect(areaId)}
                    style={styles.removeButton}
                    accessibilityRole="button"
                    accessibilityLabel={`${getAreaName(areaId)} 선택 해제`}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title="완료"
          onPress={handleComplete}
          disabled={selectedAreas.length === 0}
          style={styles.completeButton}
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
  header: {
    marginBottom: Layout.spacing.xl,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xl,
  },
  areaCard: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    position: 'relative',
  },
  selectedAreaCard: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  areaIcon: {
    fontSize: 32,
    marginBottom: Layout.spacing.sm,
  },
  selectedAreaIcon: {
    opacity: 0.8,
  },
  areaName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  selectedAreaName: {
    color: Colors.primary[700],
  },
  areaDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  selectedAreaDescription: {
    color: Colors.primary[600],
  },
  checkmark: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
    backgroundColor: Colors.primary[500],
    borderRadius: Layout.borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.sm,
    fontWeight: 'bold',
  },
  selectedContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  selectedTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    borderRadius: Layout.borderRadius.full,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  selectedTagText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary[700],
    fontWeight: '500',
    marginRight: Layout.spacing.xs,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: Layout.borderRadius.full,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.sm,
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  completeButton: {
    minHeight: Layout.touchTarget,
  },
});


