import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { RatingStars } from '../../components/RatingStars';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { mockClinics, mockReviews, Clinic, Review } from '../../lib/mock';

export default function ClinicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  useEffect(() => {
    loadClinicData();
  }, [id]);

  const loadClinicData = async () => {
    try {
      const foundClinic = mockClinics.find(c => c.id === id);
      const clinicReviews = mockReviews.filter(r => r.clinicId === id);
      
      setClinic(foundClinic || null);
      setReviews(clinicReviews);
    } catch (error) {
      console.error('클리닉 데이터 로드 실패:', error);
    }
  };

  const handleDirections = async () => {
    if (!clinic) return;

    const { lat, lng, name, address } = clinic;
    
    // 네이버맵 → 구글맵 → 애플맵 순으로 시도
    const urls = [
      `nmap://place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}&appname=Purumi`,
      `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=14`,
      `http://maps.apple.com/?q=${lat},${lng}&ll=${lat},${lng}&z=14`,
    ];

    for (const url of urls) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return;
        }
      } catch (error) {
        console.log(`URL 열기 실패: ${url}`, error);
      }
    }

    Alert.alert('오류', '지도 앱을 열 수 없습니다.');
  };

  const handleCall = () => {
    if (!clinic) return;
    Linking.openURL(`tel:${clinic.phone}`);
  };

  const handleWriteReview = () => {
    router.push(`/review/new?clinicId=${id}`);
  };

  if (!clinic) {
    return (
      <View style={styles.container}>
        <Header showBack onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>클리닉 정보를 찾을 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={clinic.name}
        showBack
        onBackPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        {/* 기본 정보 */}
        <View style={styles.section}>
          <View style={styles.header}>
            <Text style={styles.name}>{clinic.name}</Text>
            {clinic.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ 인증</Text>
              </View>
            )}
          </View>
          
          <View style={styles.ratingContainer}>
            <RatingStars rating={clinic.rating} size="large" />
            <Text style={styles.reviewCount}>
              리뷰 {clinic.reviewCount}개
            </Text>
          </View>
          
          <Text style={styles.description}>{clinic.description}</Text>
        </View>

        {/* 탭 네비게이션 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
              정보
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              리뷰 ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 컨텐츠 */}
        {activeTab === 'info' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>위치</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: clinic.lat,
                  longitude: clinic.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: clinic.lat,
                    longitude: clinic.lng,
                  }}
                  title={clinic.name}
                  description={clinic.address}
                />
              </MapView>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoValue}>{clinic.address}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>전화번호</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text style={styles.phoneNumber}>{clinic.phone}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>진료과목</Text>
              <View style={styles.specialties}>
                {clinic.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>사용 언어</Text>
              <Text style={styles.infoValue}>{clinic.languages.join(', ')}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <RatingStars rating={review.rating} size="small" />
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>아직 리뷰가 없습니다.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <Button
          title="길찾기"
          onPress={handleDirections}
          variant="outline"
          style={styles.bottomButton}
        />
        <Button
          title="리뷰 작성"
          onPress={handleWriteReview}
          style={styles.bottomButton}
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
  section: {
    backgroundColor: Colors.background.primary,
    margin: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  name: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  verifiedText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  reviewCount: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
  },
  activeTab: {
    backgroundColor: Colors.primary[500],
  },
  tabText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.text.inverse,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  mapContainer: {
    height: 200,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Layout.spacing.md,
  },
  map: {
    flex: 1,
  },
  infoRow: {
    marginBottom: Layout.spacing.md,
  },
  infoLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xs,
  },
  infoValue: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
  },
  phoneNumber: {
    fontSize: Layout.fontSize.md,
    color: Colors.primary[500],
    textDecorationLine: 'underline',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  specialtyText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary[700],
    fontWeight: '500',
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingBottom: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  reviewerName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  reviewText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Layout.spacing.sm,
  },
  reviewDate: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.tertiary,
  },
  noReviews: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  bottomButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
});


