import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

interface SignupCelebrationProps {
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SignupCelebration({ onComplete }: SignupCelebrationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const confettiAnimations = useRef<Animated.Value[]>([]).current;
  const confettiRotations = useRef<Animated.Value[]>([]).current;

  // 폭죽 애니메이션 생성
  const createConfetti = () => {
    const confettiCount = 50;
    const colors = ['#88C8C3', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    for (let i = 0; i < confettiCount; i++) {
      const animValue = new Animated.Value(0);
      const rotationValue = new Animated.Value(0);
      
      confettiAnimations.push(animValue);
      confettiRotations.push(rotationValue);
      
      // 각 폭죽의 시작 위치와 색상
      const startX = Math.random() * width;
      const startY = -50;
      const endY = height + 100;
      const duration = 3000 + Math.random() * 2000; // 3-5초
      const delay = Math.random() * 1000; // 0-1초 지연
      
      Animated.timing(animValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(rotationValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    // 메인 애니메이션 시작
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // 폭죽 애니메이션 시작
    setTimeout(() => {
      createConfetti();
    }, 500);

    // 3초 후 자동으로 완료 페이지로 이동
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const renderConfetti = () => {
    const colors = ['#88C8C3', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    return confettiAnimations.map((animValue, index) => {
      const startX = Math.random() * width;
      const startY = -50;
      const endY = height + 100;
      const color = colors[index % colors.length];
      const rotationValue = confettiRotations[index];
      
      const translateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [startY, endY],
      });
      
      const translateX = animValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [startX, startX + (Math.random() - 0.5) * 100, startX + (Math.random() - 0.5) * 200],
      });
      
      const rotate = rotationValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '720deg'],
      });
      
      const opacity = animValue.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 1, 1, 0],
      });
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: color,
              transform: [
                { translateX },
                { translateY },
                { rotate },
              ],
              opacity,
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* 폭죽 애니메이션 */}
      {renderConfetti()}
      
      {/* 메인 콘텐츠 */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* 축하 이모지 */}
        <Text style={styles.celebrationEmoji}>🎉</Text>
        
        {/* 제목 */}
        <Text style={styles.title}>회원가입 완료!</Text>
        
        {/* 부제목 */}
        <Text style={styles.subtitle}>
          Purumi에 오신 것을 환영합니다!{'\n'}
          이제 아름다운 여정을 시작해보세요 ✨
        </Text>
        
        {/* 완료 버튼 */}
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={onComplete}
        >
          <Text style={styles.completeButtonText}>시작하기</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* 배경 그라데이션 효과 */}
      <View style={styles.backgroundGradient} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(136, 200, 195, 0.1)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  completeButton: {
    backgroundColor: '#88C8C3',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#88C8C3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
