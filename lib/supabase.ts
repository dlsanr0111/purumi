import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의
export interface VideoStats {
  id: string;
  title: string;
  video_url: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface UserLike {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
}

// 비디오 통계 관련 함수들
export const videoStatsService = {
  // 비디오 조회수 증가
  async incrementView(videoId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_video_views', {
      video_id: videoId
    });
    
    if (error) {
      console.error('조회수 증가 실패:', error);
      throw error;
    }
  },

  // 좋아요 토글
  async toggleLike(videoId: string, userId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    // 먼저 현재 좋아요 상태 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('user_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    const isCurrentlyLiked = !!existingLike;

    if (isCurrentlyLiked) {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('user_likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // 좋아요 수 감소
      const { error: decrementError } = await supabase.rpc('decrement_video_likes', {
        video_id: videoId
      });

      if (decrementError) throw decrementError;
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('user_likes')
        .insert({ video_id: videoId, user_id: userId });

      if (insertError) throw insertError;

      // 좋아요 수 증가
      const { error: incrementError } = await supabase.rpc('increment_video_likes', {
        video_id: videoId
      });

      if (incrementError) throw incrementError;
    }

    // 업데이트된 좋아요 수 조회
    const { data: videoStats, error: statsError } = await supabase
      .from('video_stats')
      .select('likes')
      .eq('id', videoId)
      .single();

    if (statsError) throw statsError;

    return {
      isLiked: !isCurrentlyLiked,
      likeCount: videoStats.likes
    };
  },

  // 비디오 통계 조회
  async getVideoStats(videoId: string): Promise<VideoStats | null> {
    const { data, error } = await supabase
      .from('video_stats')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) {
      console.error('비디오 통계 조회 실패:', error);
      return null;
    }

    return data;
  },

  // 사용자의 좋아요 상태 확인
  async getUserLikeStatus(videoId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    return !!data && !error;
  }
};
