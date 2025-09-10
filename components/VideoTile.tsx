import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Video as VideoType } from '../lib/mock';
import { videoStatsService } from '../lib/supabase';

interface VideoTileProps {
  video: VideoType;
  isActive: boolean;
  onPress: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const VideoTile: React.FC<VideoTileProps> = ({
  video,
  isActive,
  onPress,
}) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [viewCount, setViewCount] = useState(video.views);
  const [commentCount, setCommentCount] = useState(video.comments);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive && !isPlaying) {
      videoRef.current?.playAsync();
      setIsPlaying(true);
      // 비디오가 재생될 때 조회수 증가
      setViewCount(prev => prev + 1);
      
      // Supabase에 조회수 업데이트 전송
      videoStatsService.incrementView(video.id).catch(error => {
        console.error('조회수 업데이트 실패:', error);
      });
    } else if (!isActive && isPlaying) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive, isPlaying, video.id]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current?.playAsync();
      setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // 좋아요 수 업데이트
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    // 하트 애니메이션
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Supabase에 좋아요 상태 전송
    try {
      const result = await videoStatsService.toggleLike(video.id, 'test-user-id');
      console.log(`비디오 ${video.id} 좋아요 상태: ${result.isLiked}, 좋아요 수: ${result.likeCount}`);
      // Supabase에서 받은 실제 좋아요 수로 업데이트
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error('좋아요 업데이트 실패:', error);
      // 실패 시 상태 롤백
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
    }
  };

  const handleComment = () => {
    console.log('댓글 버튼 클릭됨:', video.id);
    console.log('현재 모달 상태:', showCommentModal);
    setShowCommentModal(true);
    console.log('모달 상태 변경됨:', true);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${video.title} 비디오 보기`}
    >
      <Video
        ref={videoRef}
        source={{ uri: video.videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isActive}
        isLooping
        isMuted
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
          }
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.topInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
        </View>
        
        <View style={styles.bottomInfo}>
          <View style={styles.stats}>
            <Text style={styles.statText}>👀 {viewCount.toLocaleString()}</Text>
            <TouchableOpacity
              style={styles.likeContainer}
              onPress={handleLike}
              accessibilityRole="button"
              accessibilityLabel={isLiked ? '좋아요 취소' : '좋아요'}
            >
              <Animated.Text 
                style={[
                  styles.likeIcon,
                  { transform: [{ scale: heartScale }] }
                ]}
              >
                {isLiked ? '❤️' : '🤍'}
              </Animated.Text>
              <Text style={styles.likeCount}>{likeCount.toLocaleString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commentContainer}
              onPress={handleComment}
              accessibilityRole="button"
              accessibilityLabel="댓글"
            >
              <Text style={styles.commentIcon}>💬</Text>
              <Text style={styles.commentCount}>{commentCount.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? '일시정지' : '재생'}
          >
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 댓글 모달 */}
      {showCommentModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
            height: '60%',
          }}>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>댓글 모달 테스트</Text>
            <Text>비디오 ID: {video.id}</Text>
            <Text>좋아요 수: {likeCount}</Text>
            <Text>조회수: {viewCount}</Text>
            <Text>댓글 수: {commentCount}</Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'red',
                padding: 10,
                borderRadius: 5,
                marginTop: 20,
              }}
              onPress={() => setShowCommentModal(false)}
            >
              <Text style={{ color: 'white' }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenWidth * 1.3, // 4:5 비율
    backgroundColor: Colors.background.tertiary,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
  },
  topInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stats: {
    flex: 1,
  },
  statText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.inverse,
    marginBottom: Layout.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  likeIcon: {
    fontSize: Layout.fontSize.md,
    marginRight: Layout.spacing.xs,
  },
  likeCount: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  commentIcon: {
    fontSize: Layout.fontSize.md,
    marginRight: Layout.spacing.xs,
  },
  commentCount: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: Layout.borderRadius.full,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: Layout.fontSize.lg,
  },
});
