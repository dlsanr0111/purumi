import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Animated, TextInput } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

// Mock 데이터
const mockClinics = [
  {
    id: '1',
    name: '강남 뷰티클리닉',
    address: '서울특별시 강남구 테헤란로 123',
    rating: 4.8,
    reviewCount: 127,
    distance: 0.5,
    specialties: ['보톡스', '필러', '레이저'],
    verified: true,
  },
  {
    id: '2',
    name: '압구정 피부과',
    address: '서울특별시 강남구 압구정로 456',
    rating: 4.6,
    reviewCount: 89,
    distance: 1.2,
    specialties: ['여드름', '흉터', '안티에이징'],
    verified: true,
  },
  {
    id: '3',
    name: '청담 성형외과',
    address: '서울특별시 강남구 청담동 789',
    rating: 4.9,
    reviewCount: 203,
    distance: 2.1,
    specialties: ['코성형', '눈성형', '가슴성형'],
    verified: true,
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 (임시로 false)
  const [activeTab, setActiveTab] = useState('main'); // 하단 네비게이션 활성 탭
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: number]: boolean}>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentScreen === 'splash') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // 2.5초 후 페이드아웃 시작
      const fadeOutTimer = setTimeout(() => {
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 2500);

      // 3.3초 후 화면 전환
      const transitionTimer = setTimeout(() => {
        if (isLoggedIn) {
          setCurrentScreen('clinics');
        } else {
          setCurrentScreen('login');
        }
        // 페이드아웃 애니메이션 리셋
        fadeOutAnim.setValue(1);
      }, 3300);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(transitionTimer);
      };
    }
  }, [currentScreen, isLoggedIn]);

  // 하단 네비게이션 탭 데이터
  const bottomTabs = [
    { id: 'hospital', title: '병원찾기', icon: '🏥', activeIcon: '🏥' },
    { id: 'shorts', title: 'Shorts', icon: '📺', activeIcon: '📺' },
    { id: 'main', title: '메인', icon: '🏠', activeIcon: '🏠' },
    { id: 'survey', title: '부위선택', icon: '🎯', activeIcon: '🎯' },
    { id: 'profile', title: '마이페이지', icon: '👤', activeIcon: '👤' },
  ];

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'main') {
      setCurrentScreen('clinics');
    } else if (tabId === 'shorts') {
      setCurrentScreen('shorts');
    } else if (tabId === 'survey') {
      setCurrentScreen('survey');
    } else if (tabId === 'hospital') {
      setCurrentScreen('hospital');
    } else if (tabId === 'profile') {
      setCurrentScreen('profile');
    }
  };

  const toggleDescription = (itemId: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getDescriptionText = (itemId: number, fullText: string) => {
    const isExpanded = expandedDescriptions[itemId];
    const maxLength = 20; // 최대 표시 길이
    
    if (fullText.length <= maxLength || isExpanded) {
      return fullText;
    }
    
    return fullText.substring(0, maxLength) + '...';
  };

  // 하단 네비게이션 바 컴포넌트
  const BottomNavigation = () => (
    <View style={styles.bottomNav}>
      {bottomTabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
          onPress={() => handleTabPress(tab.id)}
        >
          <Text style={[styles.tabIcon, activeTab === tab.id && styles.activeTabIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const screens = {
    splash: (
      <Animated.View style={[styles.splashContainer, { opacity: Animated.multiply(fadeAnim, fadeOutAnim) }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Purumi</Text>
          <Text style={styles.tagline}>당신을 위한 투명한 리뷰</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>잠시만 기다려주세요...</Text>
        </View>
      </Animated.View>
    ),
    login: (
      <View style={styles.loginContainer}>
        <View style={styles.loginForm}>
          <View style={styles.loginLogoContainer}>
            <Text style={styles.loginLogo}>PURUMI</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => {
              setIsLoggedIn(true);
              setCurrentScreen('clinics');
            }}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => console.log('회원가입')}
          >
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => {
              setIsLoggedIn(true);
              setCurrentScreen('clinics');
            }}
          >
            <Text style={styles.guestButtonText}>게스트로 계속하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    clinics: (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 클리닉 카드들 */}
          {mockClinics.map((clinic) => (
            <View key={clinic.id} style={styles.clinicCard}>
              <View style={styles.clinicImage}>
                <Text style={styles.clinicImageText}>🏥</Text>
              </View>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                <Text style={styles.clinicAddress}>{clinic.address}</Text>
                <View style={styles.clinicRating}>
                  <Text style={styles.ratingText}>⭐ {clinic.rating}</Text>
                  <Text style={styles.reviewText}>({clinic.reviewCount})</Text>
                  <Text style={styles.distanceText}>{clinic.distance}km</Text>
                </View>
                <View style={styles.specialties}>
                  {clinic.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <BottomNavigation />
      </View>
    ),
    shorts: (
      <View style={styles.shortsContainer}>
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <View style={styles.fullScreenVideo}>
              {/* 비디오 영역 */}
              <View style={styles.videoArea}>
                <Text style={styles.videoPlaceholderText}>📺</Text>
                <Text style={styles.videoTitleOverlay}>뷰티 클리닉 후기 #{item}</Text>
              </View>
              
              {/* 우측 액션 버튼들 */}
              <View style={styles.videoActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>❤️</Text>
                  <Text style={styles.actionCount}>1.2만</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionCount}>234</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📤</Text>
                  <Text style={styles.actionCount}>공유</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>🔖</Text>
                  <Text style={styles.actionCount}>저장</Text>
                </TouchableOpacity>
              </View>
              
              {/* 하단 정보 */}
              <View style={styles.videoInfo}>
                <View style={styles.businessInfo}>
                  <View style={styles.businessAvatar}>
                    <Text style={styles.businessAvatarText}>🏥</Text>
                  </View>
                  <View style={styles.businessDetails}>
                    <View style={styles.businessNameRow}>
                      <Text style={styles.businessName}>강남 뷰티클리닉</Text>
                      <TouchableOpacity style={styles.followButton}>
                        <Text style={styles.followButtonText}>팔로우</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity 
                      onPress={() => toggleDescription(item)}
                      style={styles.descriptionContainer}
                    >
                      <Text style={styles.businessDescription}>
                        {getDescriptionText(item, "보톡스 시술 후기입니다. 자연스러운 결과가 만족스러워요! 전문의가 직접 시술하는 안전한 클리닉입니다.")}
                      </Text>
                      {expandedDescriptions[item] && (
                        <Text style={styles.collapseText}>간략히</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={800}
          snapToAlignment="start"
          decelerationRate="fast"
        />
        <BottomNavigation />
      </View>
    ),
    survey: (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.surveyGrid}>
            {[
              { name: '눈', icon: '👁️' },
              { name: '코', icon: '👃' },
              { name: '입', icon: '👄' },
              { name: '볼', icon: '😊' },
              { name: '턱선', icon: '🦴' },
              { name: '이마', icon: '🧠' },
              { name: '목', icon: '🦒' },
              { name: '팔', icon: '💪' },
              { name: '다리', icon: '🦵' },
              { name: '배', icon: '🤰' },
              { name: '등', icon: '🫁' },
              { name: '어깨', icon: '🏋️' }
            ].map((area, index) => (
              <TouchableOpacity key={index} style={styles.surveyItem}>
                <Text style={styles.surveyIcon}>{area.icon}</Text>
                <Text style={styles.surveyText}>{area.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <BottomNavigation />
      </View>
    ),
    hospital: (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {mockClinics.map((clinic) => (
            <View key={clinic.id} style={styles.hospitalCard}>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{clinic.name}</Text>
                <Text style={styles.hospitalAddress}>{clinic.address}</Text>
                <View style={styles.hospitalRating}>
                  <Text style={styles.ratingText}>⭐ {clinic.rating}</Text>
                  <Text style={styles.reviewText}>({clinic.reviewCount})</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.directionsButton}>
                <Text style={styles.directionsText}>길찾기</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <BottomNavigation />
      </View>
    ),
    profile: (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.profileName}>사용자님</Text>
            <Text style={styles.profileEmail}>user@example.com</Text>
          </View>
          
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📝</Text>
              <Text style={styles.menuText}>내 리뷰</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>❤️</Text>
              <Text style={styles.menuText}>관심 클리닉</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>알림 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={styles.menuText}>고객센터</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomNavigation />
      </View>
    ),
  };

  return (
    <>
      {screens[currentScreen as keyof typeof screens]}
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  // 스플래시 화면
  splashContainer: {
    flex: 1,
    backgroundColor: '#88C8C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 56,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#88C8C3',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },

  // 로그인 화면
  loginContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginHeader: {
    backgroundColor: '#88C8C3',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  loginForm: {
    width: '75%',
    padding: 20,
    justifyContent: 'center',
  },
  loginLogoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#88C8C3',
    letterSpacing: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#88C8C3',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#88C8C3',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  signupButtonText: {
    color: '#88C8C3',
    fontSize: 15,
    fontWeight: '600',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestButtonText: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // 메인 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 60, // Dynamic Island와 상태바 고려
  },

  // 헤더
  header: {
    backgroundColor: '#88C8C3',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  headerIconText: {
    fontSize: 20,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
  },

  // 콘텐츠
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },

  // 리스트
  listContent: {
    paddingBottom: 20,
  },

  // 비디오 플레이스홀더
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    marginTop: 20,
  },
  videoText: {
    fontSize: 64,
    marginBottom: 16,
  },
  videoSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },

  // 설문 그리드
  surveyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  surveyItem: {
    width: '28%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  surveyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  surveyText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },

  // 하단 네비게이션
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTabItem: {
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#88C8C3',
    fontWeight: '600',
  },

  // 클리닉 카드
  clinicCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clinicImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  clinicImageText: {
    fontSize: 32,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  clinicRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#1f2937',
    marginRight: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 12,
  },
  distanceText: {
    fontSize: 14,
    color: '#88C8C3',
    fontWeight: '500',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#0d9488',
    fontWeight: '500',
  },

  // 비디오 카드
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  // 병원 카드
  hospitalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  hospitalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionsButton: {
    backgroundColor: '#88C8C3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directionsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  // 프로필 카드
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 8,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
    width: '90%',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    backgroundColor: '#f0fdfa',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
    width: '90%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },

  // Shorts 스타일
  shortsContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenVideo: {
    height: 800,
    width: '100%',
    position: 'relative',
  },
  videoArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholderText: {
    fontSize: 80,
    marginBottom: 20,
  },
  videoTitleOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoActions: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  businessInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  businessAvatar: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  businessAvatarText: {
    fontSize: 20,
  },
  businessDetails: {
    flex: 1,
  },
  businessNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  businessDescription: {
    color: 'white',
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  collapseText: {
    color: '#88C8C3',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  followButton: {
    backgroundColor: '#88C8C3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
